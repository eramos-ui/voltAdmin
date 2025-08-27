// /pages/api/forms/loadGrid/getUsuariosVigentes.ts
//Para la grilla de mantención de form dinámico de usuarios

import { connectDB } from '@/lib/db';
import { NextApiRequest, NextApiResponse } from "next";
import { getUsersVigentes } from '@/app/services/users/getUsersVigentes';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectDB();
    const usersVigentes = await getUsersVigentes();
    // console.log('en API usersVigentes.length',usersVigentes.length)
    const users=usersVigentes.map( (usr:any) => {
        const usuario={...usr, valid: (usr.isValid)?'vigente':'no Vigente'};
        return usuario;
    } )
    // console.log('en api forms/loadGrid/getUsuariosVigentes',users.length);
    res.status(200).json(users);
}
