import { TranscriptInfoType, SemesterType, ClassType, ClassStatisticType } from "../types/gpaCalculatorTypes";

// prettier-ignore
const remarks = {
    '': { value: 0, include: false },
    'A+': { value: 4, include: true },
    'A': { value: 4, include: true },
    'A-': { value: 3.7, include: true },
    'B+': { value: 3.3, include: true },
    'B': { value: 3, include: true },
    'B-': { value: 2.7, include: true },
    'C+': { value: 2.3, include: true },
    'C': { value: 2, include: true },
    'C-': { value: 1.7, include: true },
    'D+': { value: 1.3, include: true },
    'D': { value: 1, include: true },
    'F': { value: 0, include: true },
    'F4': { value: 0, include: true },
    'CR': { value: 0, include: false },
    'W': { value: 0, include: false },
};

const regex = {
    semesterLine: /(Fall|Winter|Summer|Spring) Term \d{4}/,
    classLineCopyPaste: /^[\w\s]{1,7}\s+\d{3}\w?\s{3}\w/,
    classLinePDF: /^[\w\s]{1,6}\d{3}\s{4,5}/,
};

/**
 * This function is the global function used to process the input from a transcript to return a transcript info type
 * This is the only export from this file
 *
 * @export
 * @param {string} inString the input string
 * @param {*} textArea the input text are (use for validation)
 * @param {boolean} pasted wether or not it was paster
 * @return {*}  {TranscriptInfoType}
 */
export default function processTranscriptText(
    inString: string,
    textArea: HTMLTextAreaElement,
    pasted: boolean
): TranscriptInfoType {
    let semesters = getSemesters(inString, pasted);
    if (!semesters?.length) {
        textArea.setCustomValidity("Please enter a valid transcript or pdf file");
        return;
    }
    // generate relevant semester properties based on classes
    semesters.map((semester) => generateSemesterProperties(semester));
    // get gpa for transcript properties
    semesters = getRunningSemesterProperties(semesters);
    const classStatistics = getClassStatistics(semesters);

    return {
        semesters: semesters,
        overallGpa: semesters[semesters.length - 1].cumulativeGpa,
        classStatistics: classStatistics,
    };
}

/**
 * Parses through textView string and separates it into an array of semesters
 * that contain class objects with information about individual classes.
 * @param {string} inString The input string
 * @return {Array} semesters The array of semester objects
 */
function getSemesters(inString: string, pasted: boolean): Array<SemesterType> {
    const lines = inString.split("\n");
    const semesters: Array<SemesterType> = [];
    let index = -1;
    for (const line of lines) {
        // make semester
        if (regex.semesterLine.test(line)) {
            // new semester line
            index += 1;
            const semesterObj = createSemester(line);
            semesters.push(semesterObj);
        } else if (index !== -1) {
            // not a new semester line
            semesters[index].lines.push(line);
            if (pasted && regex.classLineCopyPaste.test(line)) {
                const classObj = createClass(line, pasted);
                semesters[index].classes.push(classObj);
            } else if (!pasted && regex.classLinePDF.test(line)) {
                const classObj = createClass(line, pasted);
                semesters[index].classes.push(classObj);
            }
        }
    }
    return semesters;
}

/**
 * Creates an empty semester object to be filled later with details once classes are added
 * @param {string} semesterLine string that represents the semester name
 * @return {SemesterType} object representing a semester
 */
function createSemester(semesterLine: string): SemesterType {
    const semester: SemesterType = {
        name: semesterLine.slice(0, 16).trim(),
        lines: [semesterLine], // all lines for a semester
        classes: [], // lines that match the class info pattern
        valid: null,
        totalGradePoints: null,
        totalUnitsTaken: null,
        semGpa: null,
        cumulativeGpa: null,
        cumulativeGradePoints: null,
        cumulativeUnitsTaken: null,
    };
    return semester;
}

/**
 * Function that takes in a line describing a class and parses out a class
 * object describing the class and its properties.
 * @param {string} classLine Class string
 * @return {ClassType} class object with all computed properties
 */
function createClass(classLine: string, pasted: boolean): ClassType {
    const remark = pasted ? classLine.slice(38, 41).trim() : classLine.slice(48, 51).trim();
    const classObj = pasted
        ? {
              line: classLine,
              course: classLine.slice(0, 6).trim(),
              number: parseInt(classLine.slice(6, 9)),
              desc: classLine.slice(12, 38),
              remarkStr: remark,
              remarkNum: remarks[remark]?.value,
              unitsTaken: parseFloat(classLine.slice(47, 50)),
              gradePoints: parseFloat(classLine.slice(61, 66)),
              include: remarks[remark].include,
          }
        : {
              line: classLine,
              course: classLine.slice(0, 6).trim(),
              number: parseInt(classLine.slice(6, 9)),
              desc: classLine.slice(14, 42),
              remarkStr: remark,
              remarkNum: remarks[remark]?.value,
              unitsTaken: parseFloat(classLine.slice(60, 63)),
              gradePoints: parseFloat(classLine.slice(79, 85)),
              include: remarks[remark].include,
          };
    return classObj;
}

/**
 * this takes the initial semester object and goes over each semester extracting and populating fields
 * on the object for further processing
 * gets total grade poitns
 * gets total weight
 * sets valid correctly
 * @param {SemesterType} semester initial semester object to be filled in
 * @returns {SemesterType} the filled in semester object
 */
function generateSemesterProperties(semester: SemesterType): SemesterType {
    semester.totalGradePoints = semester.classes.reduce<number>(
        (sum: number, curr: ClassType) => sum + (curr.include ? curr.gradePoints : 0),
        0
    );
    semester.totalUnitsTaken = semester.classes.reduce<number>(
        (sum: number, curr: ClassType) => sum + (curr.include ? curr.unitsTaken : 0),
        0
    );
    semester.valid = semester.classes.some((classObj) => {
        return classObj.include === true;
    });
    semester.semGpa = semester.valid ? semester.totalGradePoints / semester.totalUnitsTaken : 0.0;
    return semester;
}

/**
 * Loops over the array of semesters and uses the extracted properties to generate runnning values.
 * This may use a "number of credits to consider" property in the future if I provide a slider
 * @param {Array<SemesterType>} semesters array of semesters to have their gpa's calculated for
 * @returns {Array<SemesterType>} array of semesters with their properties calculated
 */
function getRunningSemesterProperties(semesters: Array<SemesterType>): Array<SemesterType> {
    semesters.map((semester, index) => {
        semester.cumulativeGradePoints = semesters
            .slice(0, index + 1)
            .reduce((sum: number, curr: SemesterType) => sum + (curr.valid ? curr.totalGradePoints : 0), 0);
    });

    semesters.map((semester, index) => {
        semester.cumulativeUnitsTaken = semesters
            .slice(0, index + 1)
            .reduce((sum: number, curr: SemesterType) => sum + (curr.valid ? curr.totalUnitsTaken : 0), 0);
    });

    semesters.map((semester) => {
        semester.cumulativeGpa = semester.cumulativeGradePoints / semester.cumulativeUnitsTaken;
    });

    return semesters;
}

/**
 * Gets class based statistics for the second chart
 *
 * @param {SemesterType[]} semesters
 * @return {*}  {ClassStatisticType[]}
 */
function getClassStatistics(semesters: SemesterType[]): ClassStatisticType[] {
    const classStatistics = new Map<string, ClassStatisticType>();
    semesters.forEach((semester: SemesterType) => {
        semester.classes.forEach((classObj: ClassType) => {
            if (classStatistics.has(classObj.course)) {
                const classStat = classStatistics.get(classObj.course);
                if (classObj.include) {
                    classStat.unitsTaken += classObj.unitsTaken;
                    classStat.gradePoints += classObj.gradePoints;
                }
                classStat.classes.push(classObj);
                classStatistics.set(classObj.course, classStat);
            } else {
                // add new class type to class statistic
                classStatistics.set(classObj.course, {
                    name: classObj.course,
                    unitsTaken: classObj.include ? classObj.unitsTaken : 0,
                    gradePoints: classObj.include ? classObj.gradePoints : 0,
                    gpa: null,
                    classes: [classObj],
                });
            }
        });
    });
    classStatistics.forEach((classObj) => (classObj.gpa = classObj.gradePoints / classObj.unitsTaken));
    return Array.from(classStatistics).map((arrVal) => arrVal[1]);
}
