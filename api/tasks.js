import { db } from 'hatchable';
export const access = 'user';
export const methods = ['GET','PATCH'];
const titles=['Find a business idea you can test this week','Choose your first customer group','Get beyond polite feedback','Find the pattern in customer interviews','Test whether someone will pay','Put your offer into one sentence','Explain why someone would switch','Set a price that pays for your time','Design the smallest version you can sell','Write a sales page someone can act on','Choose one place to find buyers','Write a first message that feels personal','Turn buyer questions into a week of content','Pitch a partnership that works for both sides','Turn a customer result into a case study','Prepare for a sales conversation','Reply to the objection the buyer actually raised','Write a quote a buyer can approve','Follow up when a prospect goes quiet','Find where a sale stalls','Help a new customer get their first result','Learn why buyers haven’t come back','Offer a natural second purchase','Check whether you can handle more orders','Choose one growth experiment for next month'];
export default async function(req,res){
 const uid=req.user.id;
 if(req.method==='GET'){
  for(let i=0;i<titles.length;i++) await db.query('INSERT INTO business_tasks(user_id,prompt_number,title,status) VALUES($1,$2,$3,$4) ON CONFLICT(user_id,prompt_number) DO NOTHING',[uid,i+1,titles[i],i<2?'completed':'not_started']);
  const {rows}=await db.query('SELECT prompt_number,title,status,notes,updated_at FROM business_tasks WHERE user_id=$1 ORDER BY prompt_number',[uid]);return res.json({tasks:rows});
 }
 const b=req.body||{};if(!Number.isInteger(Number(b.prompt_number))||Number(b.prompt_number)<1||Number(b.prompt_number)>25)return res.status(400).json({error:'Valid prompt_number (1–25) is required'});
 const {rows}=await db.query('UPDATE business_tasks SET status=COALESCE($3,status),notes=COALESCE($4,notes),updated_at=NOW() WHERE user_id=$1 AND prompt_number=$2 RETURNING prompt_number,title,status,notes',[uid,Number(b.prompt_number),b.status??null,b.notes??null]);
 if(!rows.length)return res.status(404).json({error:'Task not found'});return res.json({task:rows[0]});
}