//servicio consumido por: /api/usuarios/vigenteByEmail
import { User } from "@/models/User";

export const getUserVigenteByEmail = async (email: string) => {
    // console.log('en getUserVigenteByEmail email',typeof email,email);
    // const user = await User.findOne({ user: email }).sort({ createdAt: -1 });
    const usuarios=await User.find({email: email});
    // console.log('en getUserVigenteByEmail usuarios',usuarios);
    // console.log('en getUserVigenteByEmail user',user);
    // return await User.findOne({ user: email }).sort({ createdAt: -1 });
    let user = await User.findOne({ user: email, isValid: true }).sort({ createdAt: -1 });
    // const role=user.perfil;
    // user={...user,role} ;   
    //  console.log('en getUserVigenteByEmail user',user);
    return user;
  };