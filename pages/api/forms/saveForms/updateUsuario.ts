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
  await connectDB();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const {
    _id, name, email, userModification, aditionalData,
    phone, rut, valid, roleId,
  } = JSON.parse(req.body);
// console.log('en updateUsuario  req.body', _id, name, email, userModification, aditionalData, phone, rut, valid, roleId,);
 
  try {
    const roles=await Rol.find();
    const rol=roles.find(r => Number(r.value) === Number(roleId));
    const role=rol?.label;//para grabar también role que es el label del rol
    // console.log('en updateUsuario  rol',rol,role);
    if (_id) {
      // 🔁 UPDATE parcial
      const user = await User.findById(_id);

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      console.log('en updateUsuario  UPDATE user',user);
      // Solo los campos permitidos
      user.name = name;
      user.email = email;
      user.userModification = userModification;
      user.aditionalData = aditionalData;
      user.phone = phone;
      user.rut = rut;
      user.isValid = (valid ==='vigente')?true:false;
      user.role = role;
      user.roleId = roleId;

      // await user.save();

      return res.status(200).json({ message: 'Usuario actualizado', user });
    } else {
      const emailAdd=email.toString();
      const userByEmail=await getUserVigenteByEmail(emailAdd);
      // console.log('en updateUsuario  userByEmail',userByEmail);
      if (userByEmail) {
        return res.status(400).json({ error: 'Ya existe un usuario con este correo electrónico.' });
      }
      // 🆕 INSERT: completar campos faltantes
      const newUser = new User({
        name,
        email,
        userModification,
        aditionalData,
        phone,
        rut,
        isValid: (valid ==='vigente')?true:false,
        role,
        roleId,
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
      console.log('en updateUsuario  INSERT newUser',newUser);

      // await newUser.save();

      return res.status(201).json({ message: 'Usuario creado', user: newUser });
    }
  } catch (error) {
    console.error('Error en updateUsuario:', error);
    return res.status(500).json({ message: 'Error interno', error });
  }
}

// import type { NextApiRequest, NextApiResponse } from 'next';
// import { Form } from '@/models/Form'; // Asegúrate de que esta ruta sea correcta

// import { connectDB } from '@/lib/db'; // Ajusta a tu conexión Mongo
// import { getUserVigenteByEmail } from '@/app/services/users/getUserVigenteByEmail';
// import { User } from '@/models/User';
// import { addUserVersion } from '@/app/services/users/addUserVersion';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   await connectDB();
//   // const { formId } = req.query;
//   const {
//     formId,
//     idUserModification,
//     name,
//     rut,
//     email,
//     roleId,
//     contactName,
//     contactEmail,
//   } = JSON.parse(req.body); 
//   // console.log('en updateUsuario req.query',formId,req.method,JSON.parse(req.body));
//   console.log('en updateUsuario name,rut,email, idUserModification,formId,contactName,contactEmail,roleId',name,rut,email, idUserModification,formId,contactName,contactEmail,roleId);
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
//   }
//   if (!formId || Array.isArray(formId)) {
//     return res.status(400).json({ message: 'ID inválido' });
//   }
  
//   if (!email) {
//     return res.status(404).json({ error: 'No se encontró el email para actualizar al usuario' });
//   }
//   const user = await getUserVigenteByEmail(email as string);//busca el usuario por email
//   console.log('en updateUsuario user',user);
//   if (!user) { //nuevo usuario
//   //   return res.status(400).json({ message: 'Usuario no encontrado' });
//   }
//   console.log('en updateUsuario user',user);
//   if (user.name===name && user.rut===rut && user.email===email && user.roleId===roleId && user.contactName===contactName && user.contactEmail===contactEmail) {
//     return res.status(200).json({ message: 'Formulario guardado correctamente' });
//   } else {
//     const result=await addUserVersion({name,rut,email,roleId,contactName,contactEmail});
//     // const result = await User.updateOne(
//     //   {
//     //     id,
//     //     taskStatus: 'A' as 'A' | 'L', // Solo tareas disponibles deben poder cerrarse  
//     //   },      
//     //   {
//     //     $set: {
//     //       taskStatus: 'F',
//     //       taskFinishDate: new Date(),        
//     //     }
//     //   }
//     // );
//     // console.log('en updateUsuario userUpdated',userUpdated);
//   }
//   return res.status(200).json({ message: 'Formulario guardado correctamente' });
// }