const ko = {
  common: {
    copy: '복사',
    copied: '복사됨!',
    download: '다운로드',
    preview: '미리보기',
    send: '보내기',
    cancel: '취소',
    confirm: '확인',
    delete: '삭제',
    edit: '편집',
    save: '저장',
    close: '닫기',
    back: '뒤로',
    loading: '로딩중...',
    error: '오류',
    success: '성공',
    clickToCopy: '클릭하여 복사',
    videoNotSupported: '브라우저가 비디오 재생을 지원하지 않습니다',
    audioNotSupported: '브라우저가 오디오 재생을 지원하지 않습니다',
    image: '이미지',
    copyError: '복사 실패:',
  },
  home: {
    title: 'IntraPaste',
    textPlaceholder: '공유할 텍스트 입력... (Shift + Enter로 줄바꿈)',
    textPlaceholderMobile: '공유할 텍스트 입력...',
    uploadButton: '파일 업로드',
    uploading: '업로드 중...',
  },
  admin: {
    title: '관리자 패널',
    backToHome: '← 홈으로 돌아가기',
    clearAll: '모든 데이터 삭제',
    changePassword: '비밀번호 변경',
    expirationSetting: '만료 설정',
    languageSetting: '언어',
    confirmDelete: {
      title: '삭제 확인',
      message: '모든 데이터를 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.',
    },
    password: {
      title: '비밀번호 변경',
      oldPassword: '현재 비밀번호',
      newPassword: '새 비밀번호',
      empty: '비밀번호를 입력해주세요',
      incorrect: '잘못된 비밀번호',
      success: '비밀번호가 변경되었습니다',
    },
    expiration: {
      title: '만료 시간 설정',
      minutes: '분',
      minTime: '최소 시간은 1분입니다',
    },
    fileInfo: {
      fileName: '파일명',
      fileSize: '파일 크기',
      fileType: '파일 유형',
      createdAt: '생성 시간',
      expiresAt: '만료 시간',
      ip: 'IP',
      ua: 'UA',
    },
  },
  login: {
    title: '관리자 로그인',
    password: '비밀번호',
    submit: '로그인',
    error: '로그인 실패',
    incorrect: '잘못된 비밀번호',
  },
  errors: {
    uploadFailed: '업로드 실패: ',
    unknown: '알 수 없는 오류',
    networkError: '네트워크 오류',
    serverError: '서버 오류',
  },
}

export default ko
