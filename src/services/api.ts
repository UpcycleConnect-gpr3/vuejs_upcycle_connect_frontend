// Compatibilité : les modules historiques (services/forum, services/training,
// services/upcycle, services/billing) importent encore apiX depuis ce fichier.
// La configuration Axios vit désormais dans src/api/axios.ts (guide d'implémentation).
import { upcycleApiClient } from '@/api/axios'

export {
  authApiClient as apiAuth,
  forumApiClient as apiForum,
  trainingApiClient as apiTraining,
  upcycleApiClient as apiUpcycle,
  billingApiClient as apiBilling,
} from '@/api/axios'

export default upcycleApiClient
