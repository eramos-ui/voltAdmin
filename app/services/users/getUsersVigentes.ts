
import  { User }   from '@/models/User';

export const getUsersVigentes = async () => {
    return await User.aggregate([
      { $sort: { email: 1, createdAt: -1 } },
      { $group: { _id: "$email", doc: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$doc" } }
    ]);
  };
  