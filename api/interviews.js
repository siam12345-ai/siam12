import { db } from 'hatchable';
export const access = 'user';
export const methods = ['GET','POST','DELETE'];
export default async function(req,res){
 const uid=req.user.id;
 if(req.method==='GET'){
  const {rows}=await db.query('SELECT i.id,i.customer_id,c.full_name AS customer_name,i.interview_date,i.recent_experience,i.main_problem,i.trigger_event,i.workaround,i.time_spent,i.money_spent,i.satisfaction,i.what_works,i.improvement_needed,i.exact_quote,i.next_question,i.created_at FROM interviews i LEFT JOIN customers c ON c.id=i.customer_id AND c.user_id=i.user_id WHERE i.user_id=$1 ORDER BY i.interview_date DESC,i.created_at DESC',[uid]);
  return res.json({interviews:rows});
 }
 if(req.method==='POST'){
  const b=req.body||{};
  const {rows}=await db.query('INSERT INTO interviews(user_id,customer_id,interview_date,recent_experience,main_problem,trigger_event,workaround,time_spent,money_spent,satisfaction,what_works,improvement_needed,exact_quote,next_question) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id,customer_id,interview_date,main_problem,workaround,exact_quote',[uid,b.customer_id||null,b.interview_date||new Date().toISOString().slice(0,10),b.recent_experience||'',b.main_problem||'',b.trigger_event||'',b.workaround||'',b.time_spent||'',b.money_spent||'',b.satisfaction||'',b.what_works||'',b.improvement_needed||'',b.exact_quote||'',b.next_question||'']);
  return res.status(201).json({interview:rows[0]});
 }
 const id=req.body?.id;if(!id)return res.status(400).json({error:'Interview id is required'});
 const {rowCount}=await db.query('DELETE FROM interviews WHERE id=$1 AND user_id=$2',[id,uid]);return res.json({deleted:rowCount>0});
}