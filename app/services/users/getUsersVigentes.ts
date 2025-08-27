
// MongoDB 5.0+ (setWindowFields)
import  { User }   from '@/models/User';
export const getUsersVigentes = async () => {
  return await User.aggregate([
    // 1) Filtra los válidos (agrega vigente:'vigente' si aplica)
    { $match: { isValid: true /*, vigente: 'vigente' */ } },

    // 2) Normaliza email y define fecha de orden robusta
    {
      $addFields: {
        _normEmail: { $toLower: { $trim: { input: "$email" } } },
        _sortDate: {
          $ifNull: [
            "$updatedAt",
            { $ifNull: ["$createdAt", { $toDate: "$_id" }] },
          ],
        },
      },
    },

    // 3) Ordena por email asc, luego por fecha desc y _id desc (tiebreaker)
    { $sort: { _normEmail: 1, _sortDate: -1, _id: -1 } },

    // 4) Toma el primero de cada email normalizado (el más reciente)
    { $group: { _id: "$_normEmail", doc: { $first: "$$ROOT" } } },

    // 5) Devuelve el documento limpio
    { $replaceRoot: { newRoot: "$doc" } },
    { $project: { _normEmail: 0, _sortDate: 0 } },
  ]);
};


// export const getUsersVigentes = async () => {
//   return await User.aggregate([
//     // 1) Filtra los válidos (agrega vigente:'vigente' si aplica)
//     { $match: { isValid: true /*, vigente: 'vigente' */ } },

//     // 2) Normaliza email a minúsculas y define fecha de ranking robusta
//     {
//       $addFields: {
//         _normEmail: { $toLower: "$email" },
//         _rankDate: {
//           $ifNull: [
//             "$updatedAt",
//             { $ifNull: ["$createdAt", { $toDate: "$_id" }] },
//           ],
//         },
//       },
//     },

//     // 3) Rankea dentro de cada email (insensible a mayúsculas/minúsculas)
//     {
//       $setWindowFields: {
//         partitionBy: "$_normEmail",
//         sortBy: { _rankDate: -1 },
//         output: { rank: { $rank: {} } },
//       },
//     },

//     // 4) Toma el más reciente por email
//     { $match: { rank: 1 } },

//     // 5) Limpieza de campos auxiliares
//     { $project: { _normEmail: 0, _rankDate: 0, rank: 0 } },
//   ]);
// };


// import  { User }   from '@/models/User';

// export const getUsersVigentes = async () => {
//     return await User.aggregate([
//       { $match: { isValid: true } }, // 🔹 Solo documentos donde isValid es true
//       { $sort: { email: 1, createdAt: -1 } },
//       { $group: { _id: "$email", doc: { $first: "$$ROOT" } } },
//       { $replaceRoot: { newRoot: "$doc" } }
//     ]);
//   };
  