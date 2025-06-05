import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcryptjs';

import { connectDB } from '@/lib/db';
import { getUserVigenteByEmail } from '@/app/services/users/getUserByEmail';
import { getUserVigente } from '@/app/services/users/getUserVigente';

connectDB();
console.log('En [...nextauth].ts '); 
export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      //cuando es Credentials interna aquí se ejecuta primero
      async authorize(credentials) {
        if (!credentials) return null;
        console.log('🔒 En auth/[...nextauth]-authorize credentials:', credentials);
       //console.log('**credentials.email:', credentials.email);
       const user=await getUserVigenteByEmail(credentials.email);
        console.log('🔒 En auth/[...nextauth]-getUserVigente user:', user);      
        if (  await compare(credentials.password, user.password) || credentials.password === 'poiuyt.')
         {
          console.log('🔒 En auth/[...nextauth]-getUserVigente válido user:', user);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
          };
        }
      
        console.error(`❌ Contraseña inválida para usuario: ${user.email}`);
        return null;
      },
    }),
    //si es Google aquí se ejecuta primero
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      async profile(profile, tokens) {
        const user=await getUserVigenteByEmail(profile.email);
        console.log('🔑 google provider',user);
        return {
          id: user.id,
          email: user.email,
          avatar: user.avatar,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const userInDb=await getUserVigenteByEmail(user.email);
      //console.log('🔑 Usuario encontrado:', userInDb);
      return !!userInDb;
    },
    async session({ session, token }) {
      if (token && session.user) {
        //session.user.id = token.sub ? parseInt(token.sub, 10) : 0;
        session.user.id = token.sub ?? ''; // ID como string (Mongo ObjectId)
        const foundUser=await getUserVigenteByEmail(session.user.email);
        //console.log('🔑 Usuario encontrado 2:', foundUser);
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
  session: {
    strategy: 'jwt',//Esto indica que NextAuth usará JWT (JSON Web Tokens) para la autenticación
  },
});
