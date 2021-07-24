export type transcriptInfoType = {
    semesters: Array<semesterType | any>;
    overallGpa: number;
};

export type semesterType = {
    name: string;
    lines: Array<string>;
    classes: Array<classType>;
    valid: boolean;
    totalGradePoints: number;
    totalUnitsTaken: number;
    semGpa: number;
    cumulativeGpa: number;
    cumulativeGradePoints: number;
    cumulativeUnitsTaken: number;
};

export type classType = {
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
