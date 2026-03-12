// Mapa: vrijednost PARAM_INTERFACE (Oracle) → definicija modula
//
// naziv    — prikazuje se na Dashboard tipci i u naslovu ekrana
// component — React komponenta; prima props: { onLogout, onBack }
//
// Vrijednost 0 ("Nema interface-a") se ne prikazuje.

import UniverzalniImport        from './univerzalni-import';
import UniverzalniImportDodaci  from './univerzalni-import-dodaci';
import Antunovic                from './antunovic';
import Renesansa                from './renesansa';
import EbaUlazni                from './eba-ulazni';
import EbaIzlazni               from './eba-izlazni';
import EbaSve                   from './eba-sve';
import Mmk                      from './mmk';
import Proficio                 from './proficio';
import Lav                      from './lav';
import Aman                     from './aman';
import MojEracunIzlaz           from './moj-eracun-izlaz';
import MojEracunUlaz            from './moj-eracun-ulaz';
import MojEracunSvi             from './moj-eracun-svi';
import Datalab                  from './datalab';
import FinaEracun               from './fina-eracun';
import MyRent                   from './myrent';
import FinaEracunIzlaz          from './fina-eracun-izlaz';
import FinaEracunUlaz           from './fina-eracun-ulaz';
import Pl                       from './pl';
import Nausys                   from './nausys';
import Mol                      from './mol';
import Fairmas                  from './fairmas';

export const MODULI_REGISTRY = {
  1:  { naziv: 'Antunović',                          component: Antunovic           },
  2:  { naziv: 'Renesansa',                          component: Renesansa           },
  3:  { naziv: 'Import temeljnice',                   component: UniverzalniImport   },
  4:  { naziv: 'EBA — ulazni računi',                component: EbaUlazni           },
  5:  { naziv: 'EBA — izlazni računi',               component: EbaIzlazni          },
  6:  { naziv: 'EBA — svi',                          component: EbaSve              },
  7:  { naziv: 'MMK',                                component: Mmk                 },
  8:  { naziv: 'Proficio',                           component: Proficio            },
  9:  { naziv: 'LAV',                                component: Lav                 },
  10: { naziv: 'AMAN',                               component: Aman                },
  11: { naziv: 'Moj e-Račun (Izlaz)',                component: MojEracunIzlaz      },
  12: { naziv: 'Moj e-Račun (Ulaz)',                 component: MojEracunUlaz       },
  13: { naziv: 'Moj e-Račun (SVI)',                  component: MojEracunSvi        },
  14: { naziv: 'Datalab',                            component: Datalab             },
  15: { naziv: 'Fina e-Račun',                       component: FinaEracun          },
  16: { naziv: 'MyRent',                             component: MyRent              },
  17: { naziv: 'Fina e-Račun (Izlaz)',               component: FinaEracunIzlaz     },
  18: { naziv: 'Fina e-Račun (Ulaz)',                component: FinaEracunUlaz      },
  19: { naziv: 'P & L',                              component: Pl                  },
  20: { naziv: 'Univerzalni import — dodatni podaci',component: UniverzalniImportDodaci },
  21: { naziv: 'NauSYS',                             component: Nausys              },
  22: { naziv: 'MOL',                                component: Mol                 },
  23: { naziv: 'Fairmas',                            component: Fairmas             },
};
