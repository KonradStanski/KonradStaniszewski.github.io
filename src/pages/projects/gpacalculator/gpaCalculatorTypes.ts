export type TranscriptInfoType = {
    semesters: Array<SemesterType>;
    overallGpa: number;
    classStatistics: ClassStatisticType[];
};

export type SemesterType = {
    name: string;
    lines: Array<string>;
    classes: Array<ClassType>;
    valid: boolean;
    totalGradePoints: number;
    totalUnitsTaken: number;
    semGpa: number;
    cumulativeGpa: number;
    cumulativeGradePoints: number;
    cumulativeUnitsTaken: number;
};

export type ClassType = {
    line: string;
    course: string;
    number: number;
    desc: string;
    remarkStr: string;
    remarkNum: number;
    unitsTaken: number;
    gradePoints: number;
    include: boolean;
};

export type ClassStatisticType = {
    name: string;
    unitsTaken: number;
    gradePoints: number;
    gpa: number;
    classes: ClassType[];
};
