declare global {
  var mongoose: MongooseCache;
}

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      role?: string;
      id?: string;
    };
  }
  interface User {
    role?: string;
  }
  interface JWT {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    role?: string;
  }
}

export {};
