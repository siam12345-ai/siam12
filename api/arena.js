import { db } from 'hatchable';
export const access = 'user';
export const methods = ['GET','POST'];

const CHALLENGES = [
 {id:'str-01',topic:'String',level:'Easy',title:'First unique character',question:'For the string "swiss", what is the first character that appears only once?',options:['s','w','i','None'],answer:'w',explanation:'s appears three times. w appears once and comes before i, so w is the answer.',points:10},
 {id:'str-02',topic:'String',level:'Easy',title:'Palindrome check',question:'Which word is a palindrome?',options:['career','level','coding','launch'],answer:'level',explanation:'A palindrome reads the same from left to right and right to left.',points:10},
 {id:'arr-01',topic:'Array',level:'Easy',title:'Find the maximum',question:'In [4, 9, 2, 7], what is the maximum value?',options:['4','7','9','22'],answer:'9',explanation:'Scan each value and keep the largest seen so far. The maximum is 9.',points:10},
 {id:'arr-02',topic:'Array',level:'Medium',title:'Two Sum basics',question:'In [2, 7, 11, 15], which pair adds up to 9?',options:['2 and 7','7 and 11','2 and 11','11 and 15'],answer:'2 and 7',explanation:'2 + 7 = 9. A hash map can solve the general Two Sum problem in one pass.',points:15},
 {id:'stk-01',topic:'Stack',level:'Easy',title:'Stack principle',question:'A stack follows which rule?',options:['FIFO','LIFO','Random access','Sorted order'],answer:'LIFO',explanation:'Last In, First Out: the most recently pushed item is popped first.',points:10},
 {id:'stk-02',topic:'Stack',level:'Medium',title:'Trace the stack',question:'Push A, push B, then pop once. What remains on top?',options:['A','B','Empty','Both A and B'],answer:'A',explanation:'B is removed first because a stack is LIFO. A becomes the top item.',points:15},
 {id:'srch-01',topic:'Searching',level:'Easy',title:'Binary search condition',question:'What must be true before applying standard binary search?',options:['Array must be sorted','Array must contain unique values','Array must have even length','Array must contain positive numbers'],answer:'Array must be sorted',explanation:'Binary search repeatedly halves the search range, which relies on sorted order.',points:10},
 {id:'srch-02',topic:'Searching',level:'Medium',title:'Binary search speed',question:'What is the time complexity of binary search on a sorted array?',options:['O(1)','O(log n)','O(n)','O(n²)'],answer:'O(log n)',explanation:'Each comparison halves the remaining search space, giving logarithmic time.',points:15}
];

function streakFromDates(dates){
 const set=new Set(dates.map(d=>String(d).slice(0,10)));
 let streak=0;
 const cursor=new Date();
 cursor.setUTCHours(0,0,0,0);
 if(!set.has(cursor.toISOString().slice(0,10)))cursor.setUTCDate(cursor.getUTCDate()-1);
 while(set.has(cursor.toISOString().slice(0,10))){streak++;cursor.setUTCDate(cursor.getUTCDate()-1);}
 return streak;
}
export default async function(req,res){
 const uid=String(req.user.id);
 if(req.method==='GET'){
  const [summary,topics,recent,dates]=await Promise.all([
   db.query('SELECT COUNT(*)::int AS total_attempts, COUNT(*) FILTER (WHERE is_correct)::int AS correct_attempts, COALESCE(SUM(points_earned),0)::int AS points FROM career_attempts WHERE user_id=$1 AND event_type=$2',[uid,'challenge']),
   db.query('SELECT topic, COUNT(*)::int AS attempts, COUNT(*) FILTER (WHERE is_correct)::int AS correct FROM career_attempts WHERE user_id=$1 AND event_type=$2 GROUP BY topic ORDER BY topic',[uid,'challenge']),
   db.query('SELECT challenge_id,topic,event_type,is_correct,duration_seconds,created_at FROM career_attempts WHERE user_id=$1 ORDER BY created_at DESC LIMIT 8',[uid]),
   db.query('SELECT DISTINCT created_at::date::text AS day FROM career_attempts WHERE user_id=$1 ORDER BY day DESC LIMIT 90',[uid])
  ]);
  const s=summary.rows[0]||{total_attempts:0,correct_attempts:0,points:0};
  const total=Number(s.total_attempts||0),correct=Number(s.correct_attempts||0);
  return res.json({summary:{total_attempts:total,correct_attempts:correct,accuracy:total?Math.round(correct/total*100):0,points:Number(s.points||0),streak:streakFromDates(dates.rows.map(x=>x.day))},topics:topics.rows.map(x=>({...x,accuracy:x.attempts?Math.round(x.correct/x.attempts*100):0})),recent:recent.rows,challenges:CHALLENGES.map(({answer,...c})=>c)});
 }
 const b=req.body||{};
 if(b.event_type==='stack_push'||b.event_type==='stack_pop'||b.event_type==='stack_peek'){
  const item=String(b.submitted_answer||'').slice(0,80);
  await db.query('INSERT INTO career_attempts(user_id,challenge_id,topic,event_type,submitted_answer,is_correct,duration_seconds) VALUES($1,$2,$3,$4,$5,false,0)',[uid,'stack-lab','Stack',b.event_type,item]);
  return res.status(201).json({saved:true});
 }
 const challenge=CHALLENGES.find(c=>c.id===b.challenge_id);
 if(!challenge)return res.status(400).json({error:'Unknown challenge'});
 const answer=String(b.answer||'').slice(0,120);
 const seconds=Math.max(0,Math.min(3600,Number(b.duration_seconds)||0));
 const correct=answer===challenge.answer;
 await db.query('INSERT INTO career_attempts(user_id,challenge_id,topic,event_type,submitted_answer,is_correct,points_earned,duration_seconds) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[uid,challenge.id,challenge.topic,'challenge',answer,correct,correct?challenge.points:0,seconds]);
 return res.status(201).json({saved:true,correct,points:correct?challenge.points:0,explanation:challenge.explanation});
}