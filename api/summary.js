import { db } from 'hatchable';
export const access = 'user';
export const methods = ['GET'];
export default async function(req,res){
 const uid=req.user.id;
 const [c,i,t]=await Promise.all([
  db.query('SELECT COUNT(*)::int AS total,COUNT(*) FILTER(WHERE status=$2)::int AS paying FROM customers WHERE user_id=$1',[uid,'customer']),
  db.query('SELECT COUNT(*)::int AS total FROM interviews WHERE user_id=$1',[uid]),
  db.query('SELECT COUNT(*) FILTER(WHERE status=$2)::int AS completed,COUNT(*)::int AS total FROM business_tasks WHERE user_id=$1',[uid,'completed'])
 ]);
 return res.json({customers:c.rows[0],interviews:i.rows[0],prompts:t.rows[0]});
}