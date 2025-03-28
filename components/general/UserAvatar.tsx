
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

type UserAvatarProps = {
  avatarFileName: string | null;
};

const UserAvatar: React.FC<UserAvatarProps> = ({ avatarFileName }) => {
  const defaultAvatarStyles = "text-gray-500 text-2xl";  

  const avatarUrl = avatarFileName?.startsWith('http')
    ? avatarFileName
    : avatarFileName
      ? `/api/getAvatar?avatar=${encodeURIComponent(avatarFileName)}`
      : null;

  return (
    <div
      className="relative w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full"
      aria-label="User Avatar"
    >
      {avatarUrl ? (
        <Image 
          src={avatarUrl}
          alt="User Avatar"
          width={80}
          height={80}
          className="rounded-full object-cover"
        />
      ) : (
        <FontAwesomeIcon icon={faUser} className={defaultAvatarStyles} />
      )}
    </div>
  );
};

export default UserAvatar;


// import Image from 'next/image';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faUser } from '@fortawesome/free-solid-svg-icons';

// type UserAvatarProps = {
//   avatarFileName: string | null;
// };
// const UserAvatar: React.FC<UserAvatarProps> = ({avatarFileName}) => {
//   const defaultAvatarStyles = "text-gray-500 text-2xl";  
//   const avatarUrl = avatarFileName// Construir la URL del avatar
//     ? `/api/getAvatar?avatar=${encodeURIComponent(avatarFileName)}`
//     : null;
//   return (
//   <div className="relative w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full"
//     aria-label="User Avatar"
//   >
//     {avatarUrl ? (
//       <Image 
//         src={avatarUrl} // URL generada dinámicamente      
//         alt="User Avatar" 
//         //fill 
//         width={80}
//         height={80}
//         className="rounded-full object-cover" 
//       />
//     ) : (
//       <FontAwesomeIcon icon={faUser}  className={defaultAvatarStyles} />
//     )}
//   </div>
//   );
// }
// export default UserAvatar;
