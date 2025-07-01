
import  { User }   from '@/models/User';

export const getUsersVigentes = async () => {
    return await User.aggregate([
      { $match: { isValid: true } }, // 🔹 Solo documentos donde isValid es true
      { $sort: { email: 1, createdAt: -1 } },
      { $group: { _id: "$email", doc: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$doc" } }
    ]);
  };
  