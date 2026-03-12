'use strict';

// Dohvaća listu enableanih modula za dato poduzeće iz Oracle-a.
// Vraća niz integera, npr. [3, 7, 16].
//
// Tablica: itifin.params_vrijednost
// Kolona param = PARAM_INTERFACE konstanta (integer iz untConst.pas)
//
// TODO: Provjeriti točnu vrijednost PARAM_INTERFACE konstante (integer ID parametra).
//       Može se naći u Delphi untConst.pas ili u Oracle tablici itifin.params_opis.
const PARAM_INTERFACE = 27;

async function fetchModuliInterface(connection, pod) {
  if (PARAM_INTERFACE === null) {
    console.warn('PARAM_INTERFACE nije postavljen u moduliService.js');
    return [];
  }

  const sql = `
    SELECT pv.vrijednost
    FROM   itifin.params_vrijednost pv
    WHERE  pv.param = :p_param
      AND (pv.pod   = :pod OR pv.pod IS NULL)
    ORDER BY pv.vrijednost
  `;

  try {
    const result = await connection.execute(sql, { p_param: PARAM_INTERFACE, pod });
    return result.rows.map(r => Number(r[0]));
  } catch (err) {
    // Ako parametar nije dostupan, prijava i dalje prolazi — vraćamo prazan niz.
    console.warn('Ne mogu dohvatiti PARAM_INTERFACE:', err.message);
    return [];
  }
}

module.exports = { fetchModuliInterface };
