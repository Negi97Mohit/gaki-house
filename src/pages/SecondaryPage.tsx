import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";

const SecondaryPage = () => {
    const navigate = useNavigate();

    return (
        <div className="h-screen w-full bg-background flex flex-col p-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/")}
                    className="rounded-full hover:bg-muted"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-2xl font-bold">New Page</h1>
            </div>
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Content goes here...
            </div>
        </div>
    );
};

export default SecondaryPage;
