import { db } from 'hatchable';
export const access = 'user';
export const methods = ['GET','POST','PATCH','DELETE'];
export default async function(req,res){
 const uid=req.user.id;
 if(req.method==='GET'){
  const {rows}=await db.query('SELECT id, full_name, university, department, year_level, contact, source, status, notes, created_at FROM customers WHERE user_id=$1 ORDER BY created_at DESC',[uid]);
  return res.json({customers:rows});
 }
 if(req.method==='POST'){
  const b=req.body||{}; if(!String(b.full_name||'').trim()) return res.status(400).json({error:'Customer name is required'});
  const {rows}=await db.query('INSERT INTO customers(user_id,full_name,university,department,year_level,contact,source,status,notes) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id,full_name,university,department,year_level,contact,source,status,notes,created_at',[uid,String(b.full_name).trim(),b.university||'',b.department||'CSE',b.year_level||'Final-year',b.contact||'',b.source||'',b.status||'prospect',b.notes||'']);
  return res.status(201).json({customer:rows[0]});
 }
 if(req.method==='PATCH'){
  const b=req.body||{}; if(!b.id) return res.status(400).json({error:'Customer id is required'});
  const {rows}=await db.query('UPDATE customers SET full_name=COALESCE($3,full_name),university=COALESCE($4,university),department=COALESCE($5,department),year_level=COALESCE($6,year_level),contact=COALESCE($7,contact),source=COALESCE($8,source),status=COALESCE($9,status),notes=COALESCE($10,notes),updated_at=NOW() WHERE id=$1 AND user_id=$2 RETURNING id,full_name,status',[b.id,uid,b.full_name??null,b.university??null,b.department??null,b.year_level??null,b.contact??null,b.source??null,b.status??null,b.notes??null]);
  if(!rows.length)return res.status(404).json({error:'Customer not found'}); return res.json({customer:rows[0]});
 }
 const id=req.body?.id; if(!id)return res.status(400).json({error:'Customer id is required'});
 const {rowCount}=await db.query('DELETE FROM customers WHERE id=$1 AND user_id=$2',[id,uid]); return res.json({deleted:rowCount>0});
}