import {Dimensions, Platform} from 'react-native'


const width = 411.42857142857144
const height = 748.8571428571429
export const maxImage = 10
export const windowWidth = Dimensions.get('window').width;
export const windowHeight = Dimensions.get('window').height;
export const pwLength = 6
export const widthRatio = windowWidth / width
export const HeightRatio = windowHeight / height
export const systemVersion = "2.2.4"
export const scanPeriod = 20
export const scanInterval = 5


// export const domain = 'https://connect.cerebrohk.com/'
export const domain = 'https://connect-dev.cerebrohk.com/'
export const apiUri = domain + 'api-device-config/'
export const deviceApi = apiUri + 'device'
export const plantApi = apiUri + 'plant'
export const staffApi = apiUri + 'staff'
export const projApi = apiUri + 'project'
export const loginApi = domain + 'api-token-auth/'
export const adminApi = domain + 'api-admin/'
export const projAdminApi = domain + 'api-project-admin/'
export const systemApi = domain + 'api-system/'
export const userDataApi = systemApi + 'user'

export const plantRouteTaskAPI = "plant-route-task"

// export const fcmTokenAPI = "device/updatetrackerfcmtoken"
// export const getConfigAPI = "device/getconfig"       