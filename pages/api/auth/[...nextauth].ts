import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';

const prisma = new PrismaClient();
interface UserFromTVF {
  id: number;
  name: string;
  email: string;
  password: string;
  //language: string;
  theme: string;
  avatar:string;
  // Agrega otros campos según lo que devuelva tu función TVF
}

export default NextAuth({
  providers: [  
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null; //console.log('Credentials:', credentials); //deafult morpet sin . para cibeles.cl
        // const user = await prisma.user.findUnique({
        //   where: { email: credentials.email },
        // });
        // if (!user) { // Si el usuario no existe, rechazar la autenticación
        //   throw new Error('El usuario no existe. Por favor, contacta al administrador.');
        // }
        //console.log('User found:', user?.email,credentials.password,user?.password);//user con autenticación en BD
        const users = await prisma.$queryRaw<UserFromTVF[]>`SELECT * FROM getUserByEmail(${credentials.email})`;
      
        if (!users || users.length === 0) { // La TVF devuelve un array, por lo que debemos verificar la longitud
          throw new Error('El usuario no existe. Por favor, contacta al administrador.');
        }
        const user = users[0];
        //console.log('User found 2:', user, credentials.password,user.password);
        if (user && (await compare(credentials.password, user.password) || user.password !=='poiuyt.')) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            //language:user.language,// No incluimos theme y avatar en el objeto que retorna authorize
          };
        } 
        return null;
      },
    }),
        GoogleProvider({// Proveedor de autenticación con Google
          clientId: process.env.GOOGLE_CLIENT_ID || (() => { throw new Error('Missing GOOGLE_CLIENT_ID'); })(),
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || (() => { throw new Error('Missing GOOGLE_CLIENT_SECRET'); })(),
           async profile(profile) {
            const users = await prisma.$queryRaw<UserFromTVF[]>`SELECT * FROM getUserByEmail(${profile.email})`;
            if (!users || users.length === 0) { // La TVF devuelve un array, por lo que debemos verificar la longitud
              throw new Error('El usuario no existe. Por favor, contacta al administrador.');
            }
            const user = users[0];
          //   const user = await prisma.user.findUnique({
          //     where: { email: profile.email },
          //   });
    
          //   if (!user) {              
          //     throw new Error('El usuario no existe. Por favor, contacta al administrador.'); // Si el usuario no existe, rechazar la autenticación
          //   }
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              avatar:user?.avatar
              //language:user.language,
            };
           },
        }),
  ],


  callbacks: {
    async signIn({ user, account, profile }) {
      const email = user.email; //console.log('signIn',email)
      // const existingUser = await prisma.user.findUnique({
      //   where: { email },
      // });
      const existingUser = await prisma.$queryRaw<UserFromTVF[]>`SELECT * FROM getUserByEmail(${email})`;
      //const name = user.name || profile?.name || 'Default Name';
      // if (existingUser && existingUser.length > 0) {
      //   const foundUser = existingUser[0];
      
        // await prisma.user.update({
        //   where: { email },
        //   data: {
        //     name: user.name || foundUser.name,
        //   },
        // });
      //}
      return true;
    },
    
    async session({ session, token, user }) {
      if (token && session.user) {
        session.user.id = token.sub ? parseInt(token.sub, 10) : 0;
        const userInDb = await prisma.$queryRaw<UserFromTVF[]>`SELECT * FROM getUserByEmail(${session.user.email})`;
        // const userInDb = await prisma.user.findUnique({
        //   where: { id: session.user.id },
        // }); 
         //console.log('userInDb',userInDb); console.log('session',session)
        if (userInDb && userInDb.length > 0) {    
          const foundUser = userInDb[0];
          session.theme = foundUser.theme;
          //session.user.language = foundUser.language;
          // session.theme = userInDb.theme; // Asignar el rol del usuario a la sesión
          // session.user.language = userInDb.language;
        }
      }
      return session;
    },
  
    async jwt({ token, user }) {
      if (user) {
        token.sub = String(user.id);// Puedes añadir otros campos al token si lo necesitas
      } //console.log('JWT token:', token);
      return token;
    },
  },  
  pages: {
    signIn: '/login',
  },  
});
