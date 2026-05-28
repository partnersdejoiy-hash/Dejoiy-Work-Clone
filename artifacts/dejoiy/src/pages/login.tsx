import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@dejoiy.com");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await login({ data: { email, password } });
      // Redirect handled in useAuth
    } catch (err: any) {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#F26522] rounded-lg flex items-center justify-center text-white text-2xl font-black">D</div>
            <span className="text-3xl font-black tracking-tight text-[#0E1B4D]">Dejoiy</span>
          </div>
        </div>

        <Card className="border-none shadow-xl shadow-[#0E1B4D]/5">
          <CardHeader className="space-y-1 text-center pt-8 pb-6">
            <CardTitle className="text-2xl font-bold text-[#0E1B4D]">Welcome back</CardTitle>
            <CardDescription className="text-base">Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-gray-50 focus-visible:ring-[#F26522]"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <a href="#" className="text-sm font-medium text-[#F26522] hover:underline">Forgot password?</a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-gray-50 focus-visible:ring-[#F26522]"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-[#F26522] hover:bg-[#d5581e] text-white font-bold text-base mt-2"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center pb-8 pt-4">
            <p className="text-sm text-gray-500">
              Demo: <span className="font-medium text-gray-900">admin@dejoiy.com</span> / <span className="font-medium text-gray-900">demo123</span>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
