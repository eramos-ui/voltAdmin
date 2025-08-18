// context/MenuContext.tsx
//se hace cargo de la recar del menú cuando se cierra una página y se vuelve a AppContent
// están juntos el context, el provider 
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MenuItem, UserData } from '@/types/interfaces';
import { fetchUserMenu } from '@/lib/users/fetchUserMenu';

interface MenuContextType {
  user: UserData | null;
  menuData: MenuItem[] | null;
  refreshMenu: () => void;
  setUser: (user: UserData | null) => void;
}

const MenuContext = createContext<MenuContextType>({
  user: null,
  menuData: null,
  refreshMenu: () => {},
  setUser:  (user: UserData | null) => {}
});

export const useMenu = () => useContext(MenuContext);

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [menuData, setMenuData] = useState<MenuItem[] | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  // console.log('en MenuProvider user',user);
  const refreshMenu = () => {
    // console.log('en refreshMenu user',user)
    // if (user?.email && user?.role && user?.roleswkf) {
      if (user?.email && user?.perfil && user?.roleswkf) {//usé perfil y no role
      fetchUserMenu(user.email, user.perfil, user.roleswkf)
        .then(setMenuData)
        .catch(console.error);
    }
  };

  useEffect(() => {
    // console.log('en MenuContext useEffect user', user)
    refreshMenu(); // cargar cuando se setea el usuario
  }, [user]);
  return (
    <MenuContext.Provider value={{ user, menuData, refreshMenu, setUser }}>
      {children}
    </MenuContext.Provider>
  );
};
