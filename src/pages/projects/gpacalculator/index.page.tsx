import React, { useCallback, useState } from "react";
import { GetStaticProps } from "next";
import { useTheme } from "next-themes";
import { useDropzone } from "react-dropzone";
import { pdfToText } from "./util/pdfToText";
import { Results, Disclaimer } from "./components";
import { Layout } from "@app/components";
import { Upload } from "@app/svgs";
import { TranscriptInfoType } from "./types/gpaCalculatorTypes";
import processTranscriptText from "./util/transcriptProcessing";
import SampleTranscript from "./util/sampleTranscript";

export const getStaticProps: GetStaticProps = async () => ({
    props: {
        sampleTranscript: SampleTranscript(),
    },
});

export const Index = (props: { sampleTranscript: string }): JSX.Element => {
    const [transcriptInfo, setTranscriptInfo] = useState<TranscriptInfoType>({
        semesters: [],
        overallGpa: 0.0,
        classStatistics: null,
    });
    const [resultsHidden, setResultsHidden] = useState(true);
    const { theme } = useTheme();
    const [pdfFile, setPdfFile] = useState<Array<File>>([]);
    // callback function passed to dropzone to set the pdf file
    const onDrop = useCallback(
        (acceptedFiles) => {
            setPdfFile([acceptedFiles[0]]);
        },
        [pdfFile]
    );
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: ".pdf",
    });
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    if (!mounted) {
        return null;
    }

    /**
     * Handle form submit button.
     * This is the entry point for any calculations and
     *
     * @param {*} event the form event
     */
    const submitGpaForm: React.FormEventHandler<HTMLFormElement> = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // stop reload
        window.scrollTo(0, 100);

        const textArea: HTMLTextAreaElement = event.target[0];
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
        const transcriptInfo: TranscriptInfoType = processTranscriptText(inString, textArea, pasted);
        setTranscriptInfo(transcriptInfo);
        setResultsHidden(false);
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
                        Paste these contents with CTRL-V into the input box below, and then hit the button to calculate
                        grade.
                        <br />
                        Pressing the Calculate GPA button with no input runs a randomly generated gpa calculation.
                    </p>
                    <form className="flex flex-col" onSubmit={submitGpaForm}>
                        <textarea
                            className="bg-opacity-0 bg-white border-2 dark:border-gray-300 border-black rounded-md h-48 mb-4 p-2"
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
                            <div className="flex flex-grow flex-col jusitfy-center items-center text-center py-1">
                                {!pdfFile.length ? (
                                    <>
                                        <p>Click to select PDF transcript</p>
                                        <p>or drop PDF transcript here</p>
                                        <Upload theme={theme} height="36" width="36" />
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
