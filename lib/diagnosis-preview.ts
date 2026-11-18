export const diagnosisPath = '/website-diagnosis'

// The live domain never exposes this VF-A route, even if the branch is merged.
export const diagnosisPreviewEnabled =
  process.env.VERCEL_ENV === 'preview' ||
  (!process.env.VERCEL_ENV && process.env.NODE_ENV === 'development')
