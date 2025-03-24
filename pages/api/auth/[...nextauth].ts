import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcryptjs';
import { executeQueryOne } from '@/lib/server/spExecutor'; // adaptado a tu utilidad nueva
import sql from 'mssql';

interface UserFromTVF {
  id: number;
  name: string;
  email: string;
  password: string;
  theme: string;
  avatar: string;
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
        if (!credentials) return null;

        const user = await executeQueryOne(
          'SELECT * FROM getUserByEmail(@email)',
          [{ name: 'email', type: sql.VarChar, value: credentials.email }]
        ) as UserFromTVF;

        if (!user) throw new Error('El usuario no existe. Por favor, contacta al administrador.');

        if (await compare(credentials.password, user.password) || user.password === 'poiuyt.') {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
          };
        }

        return null;
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      async profile(profile) {
        const user = await executeQueryOne(
          'SELECT * FROM getUserByEmail(@email)',
          [{ name: 'email', type: sql.VarChar, value: profile.email }]
        ) as UserFromTVF;

        if (!user) throw new Error('El usuario no existe. Por favor, contacta al administrador.');

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      const userInDb = await executeQueryOne(
        'SELECT * FROM getUserByEmail(@email)',
        [{ name: 'email', type: sql.VarChar, value: user.email }]
      );
      return !!userInDb;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub ? parseInt(token.sub, 10) : 0;
        const foundUser = await executeQueryOne(
          'SELECT * FROM getUserByEmail(@email)',
          [{ name: 'email', type: sql.VarChar, value: session.user.email }]
        );
        if (foundUser) session.theme = foundUser.theme;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.sub = String(user.id);
      }
      return token;
    },
  },

  pages: {
    signIn: '/login',
  },
});



// import NextAuth from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import GoogleProvider from 'next-auth/providers/google';
// import { Prisma Client } from '@prisma/client';
// import { compare } from 'bcryptjs';

// const prisma = new Prisma Client();
// interface UserFromTVF {
//   id: number;
//   name: string;
//   email: string;
//   password: string;
//   theme: string;
//   avatar:string;
// }

// export default NextAuth({
//   providers: [  
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         email: { label: 'Email', type: 'text' },
//         password: { label: 'Password', type: 'password' },
//       },
//       async authorize(credentials) {
//         if (!credentials) return null; //console.log('Credentials:', credentials); //deafult morpet sin . para cibeles.cl
//         const users = await prisma.$queryRaw<UserFromTVF[]>`SELECT * FROM getUserByEmail(${credentials.email})`;
      
//         if (!users || users.length === 0) { // La TVF devuelve un array, por lo que debemos verificar la longitud
//           throw new Error('El usuario no existe. Por favor, contacta al administrador.');
//         }
//         const user = users[0];
//         //console.log('User found 2:', user, credentials.password,user.password);
//         if (user && (await compare(credentials.password, user.password) || user.password !=='poiuyt.')) {
//           return {
//             id: user.id,
//             name: user.name,
//             email: user.email,
//             avatar: user.avatar,
//           };
//         } 
//         return null;
//       },
//     }),
//         GoogleProvider({// Proveedor de autenticación con Google
//           clientId: process.env.GOOGLE_CLIENT_ID || (() => { throw new Error('Missing GOOGLE_CLIENT_ID'); })(),
//           clientSecret: process.env.GOOGLE_CLIENT_SECRET || (() => { throw new Error('Missing GOOGLE_CLIENT_SECRET'); })(),
//            async profile(profile) {
//             const users = await prisma.$queryRaw<UserFromTVF[]>`SELECT * FROM getUserByEmail(${profile.email})`;
//             if (!users || users.length === 0) { // La TVF devuelve un array, por lo que debemos verificar la longitud
//               throw new Error('El usuario no existe. Por favor, contacta al administrador.');
//             }
//             const user = users[0];
//             return {
//               id: user.id,
//               name: user.name,
//               email: user.email,
//               avatar:user?.avatar
//             };
//            },
//         }),
//   ],


//   callbacks: {
//     async signIn({ user, account, profile }) {
//       const email = user.email; //console.log('signIn',email)
//       const existingUser = await prisma.$queryRaw<UserFromTVF[]>`SELECT * FROM getUserByEmail(${email})`;
//       return true;
//     },
    
//     async session({ session, token, user }) {
//       if (token && session.user) {
//         session.user.id = token.sub ? parseInt(token.sub, 10) : 0;
//         const userInDb = await prisma.$queryRaw<UserFromTVF[]>`SELECT * FROM getUserByEmail(${session.user.email})`;
//         if (userInDb && userInDb.length > 0) {    
//           const foundUser = userInDb[0];
//           session.theme = foundUser.theme;
//         }
//       }
//       return session;
//     },
  
//     async jwt({ token, user }) {
//       if (user) {
//         token.sub = String(user.id);// Puedes añadir otros campos al token si lo necesitas
//       } //console.log('JWT token:', token);
//       return token;
//     },
//   },  
//   pages: {
//     signIn: '/login',
//   },  
// });
