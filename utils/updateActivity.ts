export const updateActivity =async( values:any, userModification: string) =>{

console.log('en updateActivity',values,userModification );

const response = await fetch("/api/updateActivity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      values,
      userModification,
    }),
  });


}