import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  Auth: {
    Cognito: {
      region: 'ap-southeast-2',
      userPoolId: 'ap-southeast-2_eb8VwImXf', // 실제 User Pool ID로 변경 필요
      userPoolClientId: '3rg43rduj254a1prq4qbso5u5e', // 실제 Client ID로 변경 필요
    }
  }
};

Amplify.configure(amplifyConfig);

export default amplifyConfig;


