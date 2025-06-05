import _ from 'lodash';
import  { User }   from '@/models/User';

export const getUserVigente = async (id: string) => {
  console.log('En getUserVigente id:', id);
  return await User.findOne({ id }).sort({ createdAt: -1 });
};