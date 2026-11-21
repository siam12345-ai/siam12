import { db } from 'hatchable';
export const access = 'user';
export const methods = ['GET'];
const THEMES = [
  {key:'cv_content',label:'CV content and wording',terms:['content','wording','write','writing','grammar','description','summary','bullet','language','english','professional summary']},
  {key:'formatting',label:'CV formatting and design',terms:['format','formatting','design','layout','template','font','spacing','visual','look']},
  {key:'ats',label:'ATS and job-specific tailoring',terms:['ats','keyword','tailor','tailoring','job description','specific job','application','match','screening']},
  {key:'experience',label:'Projects and experience presentation',terms:['project','experience','internship','portfolio','github','achievement','technical skill','skills section']},
  {key:'tools',label:'Tools and process difficulty',terms:['word','canva','google docs','tool','software','website','platform','ai tool','chatgpt']},
  {key:'time',label:'Time and effort',terms:['time','hour','long','slow','deadline','late','quick','effort','busy']},
  {key:'confidence',label:'Confidence and uncertainty',terms:['confidence','confident','unsure','uncertain','confused','nervous','dont know','do not know','feedback','guidance','help']}
];
function clean(v){return String(v||'').trim()}
export default async function(req,res){
 const uid=req.user.id;
 const {rows}=await db.query('SELECT id,customer_id,interview_date,recent_experience,main_problem,workaround,improvement_needed,exact_quote FROM interviews WHERE user_id=$1 ORDER BY interview_date DESC,created_at DESC',[uid]);
 const people=new Map();
 const themePeople=new Map(THEMES.map(t=>[t.key,new Set()]));
 const evidence=new Map(THEMES.map(t=>[t.key,[]]));
 let unclassified=0;
 for(const row of rows){
  const person=row.customer_id||'anonymous:'+row.id;
  if(!people.has(person))people.set(person,true);
  const text=[row.main_problem,row.improvement_needed,row.workaround].map(clean).join(' ').toLowerCase();
  const matched=THEMES.filter(theme=>theme.terms.some(term=>text.includes(term)));
  if(!matched.length && text)unclassified++;
  for(const theme of matched){
   themePeople.get(theme.key).add(person);
   const excerpt=clean(row.main_problem)||clean(row.improvement_needed)||clean(row.workaround);
   const list=evidence.get(theme.key);
   if(excerpt && list.length<5 && !list.some(x=>x.person===person))list.push({person:row.customer_id?'Linked participant':'Anonymous participant',date:row.interview_date,excerpt:excerpt.slice(0,240),quote:clean(row.exact_quote).slice(0,180)});
  }
 }
 const themes=THEMES.map(t=>({key:t.key,label:t.label,participant_count:themePeople.get(t.key).size,evidence:evidence.get(t.key)})).filter(t=>t.participant_count>0).sort((a,b)=>b.participant_count-a.participant_count);
 const n=people.size;
 return res.json({
  interview_count:rows.length,
  distinct_participants:n,
  unclassified_interviews:unclassified,
  strongest_pattern:themes[0]||null,
  confidence:n>=5?'early directional evidence':n>=2?'very small sample':'insufficient sample',
  themes,
  limitations:['Theme matching uses transparent keyword rules, not an AI judgement. Review excerpts and correct categories before making decisions.','One linked customer is counted once per theme even if interviewed more than once. Anonymous interviews are counted separately because identity cannot be verified.','Interview counts do not prove willingness to pay or market demand.']
 });
}