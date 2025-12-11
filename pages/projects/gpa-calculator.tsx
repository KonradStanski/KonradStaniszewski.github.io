import React, { useCallback, useState } from "react";
import type { GetStaticProps, NextPage } from "next";
import { useTheme } from "next-themes";
import { useDropzone } from "react-dropzone";
import { Page } from "@/components/Page";
import { pdfToText } from "@/lib/gpaCalculator/pdfToText";
import Results from "@/components/gpaCalculator/Results";
import Disclaimer from "@/components/gpaCalculator/Disclaimer";
import { TranscriptInfoType } from "@/lib/gpaCalculator/types";
import processTranscriptText from "@/lib/gpaCalculator/transcriptProcessing";
import { sampleTranscript } from "@/lib/gpaCalculator/sampleTranscript";

export const getStaticProps: GetStaticProps = async () => ({
  props: {
    sampleTranscriptText: sampleTranscript(),
  },
});

type Props = {
  sampleTranscriptText: string;
};

const GpaCalculator: NextPage<Props> = (props) => {
  const [transcriptInfo, setTranscriptInfo] = useState<TranscriptInfoType>({
    semesters: [],
    overallGpa: 0.0,
    classStatistics: [],
  });
  const [resultsHidden, setResultsHidden] = useState(true);
  const { theme } = useTheme();
  const [pdfFile, setPdfFile] = useState<Array<File>>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setPdfFile([acceptedFiles[0]]);
    },
    []
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  if (!mounted) {
    return null;
  }

  const submitGpaForm: React.FormEventHandler<HTMLFormElement> = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    window.scrollTo(0, 100);

    const textArea: HTMLTextAreaElement = (event.target as any)[0];
    let inString = "";

    if (textArea.value === "") {
      if (pdfFile.length === 0) {
        inString = props.sampleTranscriptText;
        processInString(inString, textArea, true);
      } else {
        const pdfPromise = pdfToText(pdfFile[0]);
        pdfPromise.then((pdfText) => processInString(pdfText, textArea, false));
      }
    } else {
      inString = textArea.value;
      processInString(inString, textArea, true);
    }
  };

  function processInString(
    inString: string,
    textArea: HTMLTextAreaElement,
    pasted: boolean
  ) {
    const result = processTranscriptText(inString, textArea, pasted);
    if (result) {
      setTranscriptInfo(result);
      setResultsHidden(false);
    }
  }

  return (
    <Page
      title="UofA GPA Calculator"
      description="Calculate your University of Alberta GPA from your transcript"
    >
      <div className="space-y-6">
        {resultsHidden ? (
          <>
            <section>
              <h2 className="text-xl font-bold mb-4">How to use:</h2>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>
                  Go to beartracks &gt; Academic Record &gt; Unofficial
                  Transcript.
                </p>
                <p>Press the &quot;GO&quot; button.</p>
                <p>
                  Hit CTRL-A, CTRL-C to copy paste the contents of the page.
                </p>
                <p>
                  Paste these contents with CTRL-V into the input box below, and
                  then hit the button to calculate GPA.
                </p>
                <p>
                  Pressing the Calculate GPA button with no input runs a
                  randomly generated GPA calculation.
                </p>
              </div>
            </section>

            <form className="flex flex-col space-y-4" onSubmit={submitGpaForm}>
              <textarea
                className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-md h-48 p-4 font-mono text-sm"
                placeholder={props.sampleTranscriptText}
              />
              <p className="text-gray-700 dark:text-gray-300">
                Alternatively, select or drop a PDF download of your transcript
                here:
              </p>
              <div
                {...getRootProps({
                  className:
                    "flex items-center border-2 border-gray-300 dark:border-gray-600 rounded-md h-48 cursor-pointer hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800 transition",
                })}
              >
                <input {...getInputProps()} />
                <div className="flex flex-grow flex-col justify-center items-center text-center py-1">
                  {!pdfFile.length ? (
                    <>
                      <p>Click to select PDF transcript</p>
                      <p>or drop PDF transcript here</p>
                      <svg
                        className="mt-4"
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7 10L12 15L17 10"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 15V3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M20 21H4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </>
                  ) : (
                    <div>{pdfFile[0].name}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <button
                  type="submit"
                  className="border-2 rounded-md border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  Calculate GPA
                </button>
                <button
                  type="button"
                  className="border-2 rounded-md border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  onClick={() => setPdfFile([])}
                >
                  Remove PDF
                </button>
              </div>
            </form>
          </>
        ) : (
          <Results
            theme={theme || "light"}
            transcriptInfo={transcriptInfo}
            setResultsHidden={setResultsHidden}
          />
        )}
        <Disclaimer />
      </div>
    </Page>
  );
};

export default GpaCalculator;
