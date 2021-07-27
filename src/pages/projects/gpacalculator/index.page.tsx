import React, { useCallback, useState } from "react";
import { GetStaticProps } from "next";
import { useTheme } from "next-themes";
import { useDropzone } from "react-dropzone";
import { pdfToText } from "./pdfToText";
import { Results, SampleTranscript, Disclaimer } from "./components";
import { Layout } from "@app/components";
import { classType, semesterType, transcriptInfoType } from "./gpaCalculatorTypes";

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

export const getStaticProps: GetStaticProps = async () => ({
    props: {
        sampleTranscript: SampleTranscript(),
    },
});

export const Index = (props: { sampleTranscript: string }): JSX.Element => {
    const [transcriptInfo, setTranscriptInfo] = useState<transcriptInfoType>({
        semesters: [],
        overallGpa: 0.0,
    });
    const [resultsHidden, setResultsHidden] = useState(true);
    const { theme } = useTheme();
    const [pdfFile, setPdfFile] = useState<Array<File>>([]);
    const onDrop = useCallback(
        (acceptedFiles) => {
            setPdfFile([acceptedFiles[0]]);
        },
        [pdfFile]
    );
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: ".pdf",
        maxFiles: 1,
    });

    /**
     * Handle form submit button.
     * This is the entry point for any calculations and
     *
     * @param {*} event the form event
     */
    const submitGpaForm = (event) => {
        event.preventDefault(); // stop reload
        window.scrollTo(0, 100);

        const textArea = event.target[0];
        // set text to inputted text, or if empty fall back to default
        let inString = "";

        if (textArea.value === "") {
            if (pdfFile.length === 0) {
                inString = props.sampleTranscript;
                processInString(inString, textArea, true);
            } else {
                // parse pdf for text and continue as usual
                const pdfPromise = pdfToText(pdfFile[0]);
                pdfPromise.then((pdfText) => processInString(pdfText, textArea, false));
            }
        } else {
            inString = textArea.value;
            processInString(inString, textArea, true);
        }
    };

    /**
     * function to process a provided string either from copy pasting it or from a pdf
     * requires the pasted flag, because the string positions change depending on
     * which one you are pasting
     *
     * @param {string} inString
     * @param {*} textArea
     * @param {boolean} pasted
     */
    function processInString(inString: string, textArea, pasted: boolean) {
        let semesters = getSemesters(inString, pasted);
        if (!semesters?.length) {
            textArea.setCustomValidity("Please enter a valid transcript");
            return;
        }
        // generate relevant semester properties based on classes
        semesters.map((semester) => generateSemesterProperties(semester));
        // get gpa for transcript properties
        semesters = getRunningSemesterProperties(semesters);
        const transcriptInfo = {
            semesters: semesters,
            overallGpa: semesters[semesters.length - 1].cumulativeGpa,
        };
        setTranscriptInfo(transcriptInfo);
        setResultsHidden(false);
    }

    /**
     * Parses through textView string and separates it into an array of semesters
     * that contain class objects with information about individual classes.
     * @param {string} inString The input string
     * @return {Array} semesters The array of semester objects
     */
    function getSemesters(inString: string, pasted: boolean): Array<semesterType> {
        const lines = inString.split("\n");
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
    function createClass(classLine: string, pasted: boolean): classType {
        const remark = pasted ? classLine.slice(38, 41).trim() : classLine.slice(48, 51).trim();
        const classObj = pasted
            ? {
                  line: classLine,
                  course: classLine.slice(0, 6),
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
                  course: classLine.slice(0, 6),
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
     * @param {semesterType} semester initial semester object to be filled in
     * @returns {semesterType} the filled in semester object
     */
    function generateSemesterProperties(semester: semesterType): semesterType {
        semester.totalGradePoints = semester.classes.reduce<number>(
            (sum: number, curr: classType) => sum + (curr.include ? curr.gradePoints : 0),
            0
        );
        semester.totalUnitsTaken = semester.classes.reduce<number>(
            (sum: number, curr: classType) => sum + (curr.include ? curr.unitsTaken : 0),
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
     * @param {Array<semesterType>} semesters array of semesters to have their gpa's calculated for
     * @returns {Array<semesterType>} array of semesters with their properties calculated
     */
    function getRunningSemesterProperties(semesters: Array<semesterType>): Array<semesterType> {
        semesters.map((semester, index) => {
            semester.cumulativeGradePoints = semesters
                .slice(0, index + 1)
                .reduce((sum: number, curr: semesterType) => sum + (curr.valid ? curr.totalGradePoints : 0), 0);
        });

        semesters.map((semester, index) => {
            semester.cumulativeUnitsTaken = semesters
                .slice(0, index + 1)
                .reduce((sum: number, curr: semesterType) => sum + (curr.valid ? curr.totalUnitsTaken : 0), 0);
        });

        semesters.map((semester) => {
            semester.cumulativeGpa = semester.cumulativeGradePoints / semester.cumulativeUnitsTaken;
        });

        return semesters;
    }

    return (
        <Layout>
            <div className="m-auto px-4 md:px-10">
                <h1 className="text-center text-5xl font-bold pb-10 pt-0 md:pt-10">UofA GPA Calculator</h1>
            </div>
            {resultsHidden ? (
                <>
                    <h1>How to use:</h1>
                    <p>
                        Go to beartracks {">"} Academic Record {">"} Unofficial Transcript.
                        <br />
                        Press the {'"'}GO{'"'} button.
                        <br />
                        Hit CTRL-A, CTRL-C to copy paste the contents of the page. <br />
                        Paste these contentes with CTRL-V into the input box below, and then hit the button to calculate
                        grade.
                    </p>
                    <form className="flex flex-col" onSubmit={submitGpaForm}>
                        <textarea
                            className="bg-opacity-0 bg-white border-2 dark:border-gray-300 border-black rounded-md h-48 mb-2"
                            placeholder={props.sampleTranscript}
                        />
                        <p>Alternatively, select or drop a PDF download of your transcript here:</p>
                        {/* PDF SELECT */}
                        <div
                            {...getRootProps({
                                className:
                                    "flex items-center border-2 dark:border-gray-300 border-black rounded-md h-48 mb-6 cursor-pointer hover:shadow-md hover:bg-gray-50 dark:hover:bg-opacity-5 hover:bg-opacity-40",
                            })}
                        >
                            <input {...getInputProps()} />
                            <div className="flex flex-grow flex-col jusitfy-center text-center py-1">
                                {!pdfFile.length ? (
                                    <>
                                        <p>Click to select PDF transcript</p>
                                        <p>or drop PDF transcript here</p>
                                    </>
                                ) : (
                                    <div>{pdfFile[0].name}</div>
                                )}
                            </div>
                        </div>
                        {/* Calculate button */}
                        <div className="flex items-center justify-center">
                            <button
                                type="submit"
                                className="border-2 rounded-md border-black p-1 m-auto bg-gray-200 dark:bg-gray-800 dark:border-gray-400"
                            >
                                Calculate GPA
                            </button>
                            <button
                                type="button"
                                className="border-2 rounded-md border-black p-1 m-auto bg-gray-200 dark:bg-gray-800 dark:border-gray-400"
                                onClick={() => setPdfFile([])}
                            >
                                Remove PDF
                            </button>
                        </div>
                    </form>
                </>
            ) : (
                <Results theme={theme} transcriptInfo={transcriptInfo} setResultsHidden={setResultsHidden} />
            )}
            <Disclaimer />
        </Layout>
    );
};

export default Index;
