import axios from 'axios'
import { makeUseAxios } from 'axios-hooks'
import * as constants from '../global/constants'

export const useDeviceAxios = makeUseAxios({
  axios: axios.create({ baseURL: constants.deviceApi })
})

export const useCongigAxios = makeUseAxios({
    axios: axios.create({ baseURL: constants.apiUri })
  })

export const usePlantAxios = makeUseAxios({
    axios: axios.create({ baseURL: constants.plantApi })
})

export const useStaffAxios = makeUseAxios({
    axios: axios.create({ baseURL: constants.staffApi })
})

export const useaAuthAxios = makeUseAxios({
    axios: axios.create({ baseURL: constants.loginApi })
})

export const useaAdminAxios = makeUseAxios({
    axios: axios.create({ baseURL: constants.projAdminApi })
})

