"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
//import { useRouter } from 'next/router';
//import menuConfig from '../../data/menu-data.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { iconMap } from '../iconMap';
import { MenuConfig, UserData } from '@/types/interfaces';
import { SubMenuItem } from '../../types/interfaces';


type SidebarProps = {
  isVisible: boolean;
  closeSidebar: () => void;
  user: UserData;
  menuData: MenuConfig | null;
};

const Sidebar: React.FC<SidebarProps> = ({ isVisible, closeSidebar, user, menuData }) => {
  
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const sidebarRef                    = useRef<HTMLDivElement>(null);
  const router                        = useRouter();
  const toggleSubMenu                 = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  //console.log('Siderbar menuData',menuData );
  // const navigateTo = useCallback( ( url: string ) => {
  //   //toggleSubMenu();//esto ocultará el menú al tocar el mismo menú
  //   //console.log('navigateTo en menu', url)
  //   router.push( url );
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      closeSidebar();
    }
  }, [closeSidebar]);
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);
  const handleNavigation = (subitem:SubMenuItem ) => {
    closeSidebar();
    const path=subitem.path;
    const subMenuId=subitem.id;
    const processType=subitem.processType;
    const processActivity=String(subitem.idActivity);
    const urlProcess=`/toDoList/${processActivity}`;
    if (processType && processType ===1 && (!processActivity || processActivity.length<=0 ) ){
      alert(`Menú mal configurado para ${subitem}` ) 
      return; 
    }
    if( processType === 1) {
      //console.log('subitem,path,processType,processActivity',subitem,path,processType,urlProcess);
      router.push(urlProcess);
    } else {
      if (subitem.form) {// Si el campo "form" no es null, redirige el formulario construido desde JSON
          router.push(`/${subMenuId}`);
          } else {// Si el campo "form" es null, redirige a la dirección especificada en "path"
            router.push(path);
       }
    }
  };
  
  if (!isVisible || !menuData ) return null;
  const { menuItems } = menuData;
  const sidebarClass = 'order-last';
  return (
    <>
    {/* {console.log('JSX SideBar-menuItems',!menuItems, !isVisible )} */}
      <div ref={sidebarRef} className={`w-96 h-full bg-gray-800 text-white rounded-lg shadow-lg p-2 ${sidebarClass}`}>
        <ul>
          {menuItems.map((item, index) => {
            //console.log('en JSX ext',item,index);
          return (
            <li key={item.id} className="border-b border-gray-700">
              <div
                className="flex justify-between items-center p-4 hover:bg-gray-700 cursor-pointer"
                onClick={() => toggleSubMenu(item.id)}
              >
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={iconMap[item.icon]} />
                  <span>{item.title}</span>
                </div>
                {item.subMenu && item.subMenu.length > 0 && (
                  <span>{activeIndex === index ? '-' : '+'}</span>
                )}
              </div>
              { (item.subMenu && item.subMenu.length > 0 && activeIndex === item.id) && (
                <ul className="pl-8" >
                  {item.subMenu.map((subItem, subIndex) => {
                    //console.log('en JSX int',subItem,subIndex);
                    return (
                    <li key={subItem.id} className="p-2 hover:bg-gray-700">
                      <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleNavigation(subItem)}>
                        <FontAwesomeIcon icon={iconMap[subItem.icon]} />
                        <span>{subItem.title}</span>
                      </div>
                    </li>
                    )
                  })}
                </ul>
              )}
            </li>
            )
          })}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;