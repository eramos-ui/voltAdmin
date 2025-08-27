// /pages/api/forms/saveForms/updateUsuario.ts
/*
Aquí se graba el formulario dinámico de la coleción User de la BD
*/
import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Rol } from '@/models/Rol';
import { getUserVigenteByEmail } from '@/app/services/users/getUserVigenteByEmail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('en updateUsuario');
  await connectDB();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }
  const { action='edit', idUserModification, row, password } = JSON.parse(JSON.stringify(req.body));//sólo vienen estos 4 datos
  console.log('en updateUsuario req.body',  action,idUserModification, row);

  //  if (action ==='delete') {
  //   const id=row._id;
  //   const user = await User.findById(id);
  //     if (!user) {
  //       return res.status(404).json({ message: 'Usuario no encontrado' });
  //     }
  //     user.isValid=false;
  //     user.valid="no Vigente"
  //     await user.save();
  //     return res.status(200).json({ message: 'Usuario eliminado' });
  //  }
   console.log('en Api update usuarios row',row)
   let email=row.email as string;
   email=email.toLowerCase();
    const roles=await Rol.find();
    const rol=roles.find(r => Number(r.value) === Number(row.roleId));
    const perfil=rol?.label;//para grabar también role que es el label del rol
    // console.log('en updateUsuario  rol',rol,role);
    let idUser=0;
    let clave=password;

    const id=(row._id)?row._id: null;
    if (!id || id === null){
      // 🔁 UPDATE parcial
      
      const userSameEmail = await getUserVigenteByEmail(email);
      try {
        if (userSameEmail) {
          // console.log('usuario repetido')
          return res.status(404).json({ message: `Error se encontró usuario con el mismo email ${userSameEmail.email}` });
        }
        type IdUserOnly = { idUser: number };//busca idUser
        const userMax = await User.findOne({}, 'idUser')
          .sort({ idUser: -1 })
          .lean<IdUserOnly | null>();
        //  console.log('userMax',userMax,typeof userMax, userMax?.idUser)
         if  (userMax)  idUser= userMax?.idUser;
        // res.status(200).json({ maxIdUser: userMax ? NumberuserMax.idUser : null });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el mayor idUser' });
      }     

      // Solo los campos permitidos
      const newUser= new User({
        name : row.name,
        email : email,
        userModification : idUserModification,
        aditionalData : row.aditionalData,
        phone : row.phone,
        rut : row.rut,
        user: email,
        isValid : true,
        perfil,
        roleId : row.roleId,
        password,
        theme: 'light',
        system: 'fotvadmin',   
        valid: 'vigente',
        validDate: new Date(),
        roleswkf: [],
        idUser,
      });
      console.log('en crea usuario en UPDATE user',newUser,perfil);
      try{
        await newUser.save();
        return res.status(201).json({ message: 'Usuario actualizado', user: newUser.name });         
      }catch(error){
        console.log(error);
        return res.status(500).json({ message: 'Error al grabar nuevo usuario' });
      }
    } else {
      const user = await User.findById(id);
      
      // 🆕 INSERT: completar campos faltantes
      const actualizaUser = new User({
        name: row.name,
        email: email,
        userModification:idUserModification,
        aditionalData:row.aditionalData,
        phone:row.phone,
        rut:row.rut,
        isValid: true,
        perfil,
        roleId: row.roleId,
        // Campos adicionales requeridos
        user: email,                      // por ejemplo, usar email como user si no se define
        password: 'changeme123',         // ⚠️ reemplazar luego por un flujo real de password
        theme: 'light',
        system: 'fotvadmin',                 // por defecto, si aplica
        valid: 'vigente',
        validDate: new Date(),
        avatar: '',                      // opcional
        roleswkf: [],
      });
      try{
        await actualizaUser.save();
        return res.status(201).json({ message: 'Usuario actualizado', user: actualizaUser.name });      
      
      }catch(error){
        console.log(error);
        return res.status(500).json({ message: 'Error al grabar nuevo usuario que existía' });
      }
    }
  }
