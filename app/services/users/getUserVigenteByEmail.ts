//servicio consumido por: /api/usuarios/vigenteByEmail
import { User } from "@/models/User";

export const getUserVigenteByEmail = async (email: string) => {
    // console.log('en getUserVigenteByEmail email',typeof email,email);
   // const usuarios=await User.find({email: email.toLowerCase()});
    // console.log('en getUserVigenteByEmail usuarios',usuarios);
    let user = await User.findOne({ user: email.toLowerCase(), isValid: true }).sort({ updatedAt: -1 });
    // user={...user,role} ;   
     console.log('en getUserVigenteByEmail user',user);
    return user;
  };