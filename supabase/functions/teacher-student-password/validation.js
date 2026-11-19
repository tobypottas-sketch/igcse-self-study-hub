const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function validateTeacherPasswordAction(body){
 if(!body||typeof body!=='object'||Array.isArray(body))throw new Error('Invalid request.');
 if(body.action==='list'&&Object.keys(body).length===1)return {action:'list'};
 if(body.action==='reset'&&Object.keys(body).length===2&&UUID.test(body.studentId??''))return {action:'reset',studentId:body.studentId};
 throw new Error('Invalid password reset request.');
}
export function canManageStudent({actor,student,membership,assigned}){
 return Boolean(actor?.active===true&&['teacher','admin'].includes(actor.role)&&
  student?.active===true&&student.role==='student'&&Boolean(membership)&&membership.ended_at==null&&
  (actor.role==='admin'||assigned===true));
}
export function createReadablePassword(random=crypto.getRandomValues.bind(crypto)){
 const words=['Apple','Beach','Berry','Breeze','Bridge','Cloud','Coral','Daisy','Eagle','Ember','Falcon','Fern','Forest','Garden','Harbor','Honey','Island','Jade','Lemon','Maple','Mango','Meadow','Ocean','Olive','Panda','Pearl','River','Robin','Rocket','Ruby','Solar','Stone','Tiger','Tulip','Willow','Winter'];
 const bytes=new Uint32Array(4);random(bytes);
 const picked=bytes.slice(0,3).map(n=>words[n%words.length]);
 return picked.join('')+String(bytes[3]%10000).padStart(4,'0');
}
