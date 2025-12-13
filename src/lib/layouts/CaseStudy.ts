// src/lib/layouts/CaseStudy.ts
import { CanvasLayoutTemplate } from "@/types/layout";

export const CASE_STUDY_TEMPLATE: CanvasLayoutTemplate = {
    id: "case-study",
    name: "Case Study",
    description: "Vertical list of case studies with gallery and details",
    sections: [
        {
            id: "case-1",
            name: "Project One",
            description: "Description for the first project.",
            style: {
                backgroundColor: "#ffffff",
                color: "#000000",
            },
        },
        {
            id: "case-2",
            name: "Project Two",
            description: "Description for the second project.",
            style: {
                backgroundColor: "#f5f5f5",
                color: "#000000",
            },
        },
        {
            id: "case-3",
            name: "Project Three",
            description: "Description for the third project.",
            style: {
                backgroundColor: "#ffffff",
                color: "#000000",
            },
        },
    ],
};
