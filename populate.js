import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; 

const prisma = new PrismaClient();

async function main() {
  // Cargar roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin' }
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'User' },
    update: {},
    create: { name: 'User' }
  });

  // Cargar un usuario
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'Default User',
      email: 'user@example.com',
      password: hashedPassword,
      roleId: userRole.id, // Asigna el rol 'User'
      theme: 'light', // Establece un valor predeterminado para el tema
    }
  });

  console.log('User created:', user);

  //import {} from './data/menu-data.json'
   // Cargar menús y submenús desde menu-data.json
   const menuData = JSON.parse(await fs.readFile('./data/menu-data.json', 'utf8'));

   if (Array.isArray(menuData.menus)) {
     for (const menu of menuData.menus) {
       const createdMenu = await prisma.menu.create({
         data: {
           title: menu.title,
           path: menu.path,
           icon: menu.icon,
           subMenu: {
             create: menu.subMenu.map((sub) => ({
               title: sub.title,
               path: sub.path,
               icon: sub.icon,
             }))
           }
         }
       });
 
       console.log(`Menu "${createdMenu.title}" creado con ID: ${createdMenu.id}`);
     }
   } else {
     console.error('El formato de menu-data.json no es el esperado.');
   }
 }
 
 // Ejecutar la función principal
 main()
   .catch(e => console.error(e))
   .finally(async () => {
     await prisma.$disconnect();
   });