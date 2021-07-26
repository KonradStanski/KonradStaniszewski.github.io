import React, { useState } from 'react';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { useTheme } from 'next-themes';
import {
    Layout,
    Semester,
    TranscriptChart,
    SampleTranscript,
} from '@app/components';
import {
    classType,
    semesterType,
    transcriptInfoType,
} from '@app/types/gpacalculator';

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
    classLine: /^[\w\s]{1,7}\s+\d{3}\s{3}\w/,
};

export const getStaticProps: GetStaticProps = async () => ({
    props: {
        sampleTranscript: SampleTranscript(),
    },
});

type props = {
    sampleTranscript: string;
};

export const Index = (props: props): JSX.Element => {
    const [transcriptInfo, setTranscriptInfo] = useState<transcriptInfoType>({
        semesters: [],
        overallGpa: 0.0,
    });
    const [gpaHidden, setGpaHidden] = useState(true);
    const { theme } = useTheme();
    const submitGpaForm = (event) => {
        event.preventDefault(); // stop reload
        const textArea = event.target[0];
        // set text to inputted text, or if empty fall back to default
        let inString = '';
        if (textArea.value === '') {
            inString = props.sampleTranscript;
        } else {
            inString = textArea.value;
        }

        let semesters = getSemesters(inString);
        // generate relevant semester properties based on classes
        semesters.map((semester) => generateSemesterProperties(semester));
        // get gpa for transcript properties
        semesters = getRunningSemesterProperties(semesters);
        const transcriptInfo = {
            semesters: semesters,
            overallGpa: semesters[semesters.length - 1].cumulativeGpa,
        };
        setTranscriptInfo(transcriptInfo);
        setGpaHidden(false);
    };

    /**
     * Parses through textView string and separates it into an array of semesters
     * that contain class objects with information about individual classes.
     * @param {string} inString The input string
     * @return {Array} semesters The array of semester objects
     */
    function getSemesters(inString: string): Array<semesterType> {
        const lines = inString.split('\n');
        const semesters: Array<semesterType> = [];
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
                if (regex.classLine.test(line)) {
                    // create a class objesct with values extracted
                    const classObj = createClass(line);
                    semesters[index].classes.push(classObj);
                }
            }
        }
        return semesters;
    }

    /**
     * Creates an empty semester object to be filled later with details once classes are added
     * @param {string} semesterLine string that represents the semester name
     * @return {semesterType} object representing a semester
     */
    function createSemester(semesterLine: string): semesterType {
        const semester: semesterType = {
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
     * @return {classType} class object with all computed properties
     */
    function createClass(classLine: string): classType {
        const remark = classLine.slice(38, 41).trim();
        const classObj: classType = {
            line: classLine,
            course: classLine.slice(0, 6),
            number: parseInt(classLine.slice(6, 9)),
            desc: classLine.slice(12, 38),
            remarkStr: remark,
            remarkNum: remarks[remark].value,
            unitsTaken: parseFloat(classLine.slice(47, 50)),
            gradePoints: parseFloat(classLine.slice(61, 66)),
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
     * @param {semesterType} semester initial semester object to be filled in
     * @returns {semesterType} the filled in semester object
     */
    function generateSemesterProperties(semester: semesterType): semesterType {
        semester.totalGradePoints = semester.classes.reduce<number>(
            (sum: number, curr: classType) =>
                sum + (curr.include ? curr.gradePoints : 0),
            0
        );
        semester.totalUnitsTaken = semester.classes.reduce<number>(
            (sum: number, curr: classType) =>
                sum + (curr.include ? curr.unitsTaken : 0),
            0
        );
        semester.valid = semester.classes.some((classObj) => {
            return classObj.include === true;
        });
        semester.semGpa = semester.valid
            ? semester.totalGradePoints / semester.totalUnitsTaken
            : 0.0;
        return semester;
    }

    /**
     * Loops over the array of semesters and uses the extracted properties to generate runnning values.
     * This may use a "number of credits to consider" property in the future if I provide a slider
     * @param {Array<semesterType>} semesters array of semesters to have their gpa's calculated for
     * @returns {Array<semesterType>} array of semesters with their properties calculated
     */
    function getRunningSemesterProperties(
        semesters: Array<semesterType>
    ): Array<semesterType> {
        semesters.map((semester, index) => {
            semester.cumulativeGradePoints = semesters
                .slice(0, index + 1)
                .reduce(
                    (sum: number, curr: semesterType) =>
                        sum + (curr.valid ? curr.totalGradePoints : 0),
                    0
                );
        });

        semesters.map((semester, index) => {
            semester.cumulativeUnitsTaken = semesters
                .slice(0, index + 1)
                .reduce(
                    (sum: number, curr: semesterType) =>
                        sum + (curr.valid ? curr.totalUnitsTaken : 0),
                    0
                );
        });

        semesters.map((semester) => {
            semester.cumulativeGpa =
                semester.cumulativeGradePoints / semester.cumulativeUnitsTaken;
        });

        return semesters;
    }

    return (
        <Layout>
            <div className="m-auto px-4 md:px-10">
                <h1 className="text-center text-5xl font-bold pb-10 pt-0 md:pt-10">
                    UofA GPA Calculator
                </h1>
            </div>
            <h1>How to use:</h1>
            <p>
                Go to beartracks {'>'} Academic Record {'>'} Unofficial
                Transcript.
                <br />
                Press the {'"'}GO{'"'} button.
                <br />
                Hit CTRL-A, CTRL-C to copy paste the contents of the page.{' '}
                <br />
                Paste these contentes with CTRL-V into the input box below, and
                then hit the button to calculate grade.
            </p>
            <form className="flex flex-col" onSubmit={submitGpaForm}>
                <textarea
                    className="border-2 border-black rounded-md h-96 mb-2"
                    placeholder={props.sampleTranscript}
                />
                <button
                    type="submit"
                    className="border-2 rounded-md border-black p-1 m-auto bg-gray-200 dark:bg-gray-800 dark:border-gray-400"
                >
                    Calculate
                </button>
            </form>

            {/* Results Section */}
            <div className={`${gpaHidden ? 'hidden' : ''}`}>
                {/* Gpa Calculation content */}
                <h1>{`Your final GPA is: ${transcriptInfo.overallGpa.toFixed(
                    4
                )}`}</h1>
                <TranscriptChart
                    transcriptInfo={transcriptInfo}
                    theme={theme}
                />
                <div className="mb-6">
                    {transcriptInfo.semesters.map((semester) => {
                        return (
                            <Semester key={semester.name} semester={semester} />
                        );
                    })}
                </div>
            </div>

            {/* Disclaimer Section */}
            <div className="pt-10">
                <h2>**Disclaimer**</h2>
                <p>
                    This calculator is loosely based on this:{' '}
                    <Link href="https://calendar.ualberta.ca/content.php?catoid=34&navoid=10107#additional-grades-and-remarks">
                        UofA Academic Regulations
                    </Link>
                    <br />
                    It does not however calculate graduating GPA{"'"}s as the
                    way those are calculated differs from faculty to faculty.
                    <br />
                    For engineers, you can base your calcuation on this:{' '}
                    <Link href="https://calendar.ualberta.ca/content.php?catoid=34&navoid=10151#:~:text=program.-,engineering%20graduation%20average,-%E2%80%8BThe">
                        UofA Engineering Academic Regulations
                    </Link>
                    <br />
                    For ales, you can base your calcuation on this:{' '}
                    <Link href="https://calendar.ualberta.ca/content.php?catoid=34&navoid=10299#:~:text=graduation%20grade%20point%20average">
                        UofA ALES Academic Regulations
                    </Link>
                    <br />
                    I do not guarantee the accuracy of the determined GPA, and
                    take no responsability for any use of the generated gpa
                    anywhere and by anyone.
                    <br />
                    This website does not collect any user data, and makes no
                    network calls with respect to the data provided. If you want
                    to double check for yourself, you can check the requisite
                    code for this page here:
                    <Link href="https://github.com/KonradStanski/KonradStaniszewski.github.io/blob/master/src/pages/projects/gpacalculator.tsx">
                        Github Repo
                    </Link>
                </p>
            </div>
        </Layout>
    );
};

export default Index;
