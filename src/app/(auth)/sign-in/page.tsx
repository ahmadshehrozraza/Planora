
import { SignInCard } from '@/features/auth/components/sign-in-card';
import { redirect } from 'next/navigation';

const SignInPage = async () => { 

  return (
    <div>
      <SignInCard />
    </div>
  )
}

export default SignInPage
