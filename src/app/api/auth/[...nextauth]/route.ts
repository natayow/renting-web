import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

type LoginResponse = {
  data: {
    safeUser: {
      id: string;
      role: string;
      fullName: string;
    };
    token: string;
  };
};

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'email', type: 'text' },
        password: { label: 'password', type: 'text' },
      },
      async authorize(_) {
        // ini yg pertama kali di trigger pada saat login
        try {
          const response = await axios.post<LoginResponse>(
            'http://localhost:8000/api/auth/login', { email: _?.email, password: _?.password },
            {
              headers: {
                'Content-Type': 'application/json',
                'X-Internal-Auth': process.env.NEXTAUTH_INTERNAL_SECRET!,
              },
            }
          );

          return {
            id: response?.data?.data?.safeUser?.id,
            role: response?.data?.data?.safeUser?.role,
            token: response?.data?.data?.token,
            fullName: response?.data?.data?.safeUser?.fullName,
          };
        } catch (error: any) {
          const message = error?.response?.data?.message ||
          'Login failed. Please try again.';
            throw new Error(message);
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        

        token.fullName = user?.fullName;
        token.id = user?.id;
        token.role = user?.role;
        token.accessToken = user?.token;
      }
      return token;
    },
    async session({ session, token }) {
        if (token && session.user) {
            (session.user as { id: string }).id = token?.id as string;
            (session.user as { role: string }).role = token?.role as string;
            (session.user as { fullName: string }).fullName = token?.fullName as string;
            (session.user as { accessToken: string }).accessToken = token?.accessToken as string;
        }   

        return session;
    },
  },
});

export { handler as GET, handler as POST };