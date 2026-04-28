import { Session } from "@supabase/supabase-js";
import { PropsWithChildren, useEffect, useState } from "react";

import { AuthContext } from "@/lib/hooks/use-auth-context";
import { supabase } from "@/lib/utils/supabase";

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<Session | null | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        isLoggedIn: session !== undefined && session !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
