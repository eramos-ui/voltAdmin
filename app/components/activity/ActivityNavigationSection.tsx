import { useRouter } from 'next/navigation';
import { CustomButton } from '@/app/components/controls';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

const ActivityNavigationSection = () => {
  const router = useRouter();

  return (
    <CustomButton buttonStyle="primary" size="small" htmlType="button" label="Volver al página inicial"
      style={{ marginLeft: 5 }}
      icon={<FontAwesomeIcon icon={faHome} size="lg" color="white" />}
      onClick={() => router.push('/')}
    />
  );
};

export default ActivityNavigationSection;
