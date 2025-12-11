import Link from "next/link";

const Disclaimer = (): JSX.Element => {
  return (
    <div className="pt-10">
      <h2 className="text-xl font-bold mb-4">Disclaimer</h2>
      <div className="text-gray-700 dark:text-gray-300 space-y-2">
        <p>
          This calculator is loosely based on{" "}
          <Link
            href="https://calendar.ualberta.ca/content.php?catoid=34&navoid=10107#additional-grades-and-remarks"
            className="text-sky-400 hover:text-sky-500"
          >
            the UofA Academic Regulations
          </Link>
          .
        </p>
        <p>
          It does not calculate graduating GPAs which are calculated uniquely
          by each faculty.
        </p>
        <p>
          For engineers, you can base your calculation on{" "}
          <Link
            href="https://calendar.ualberta.ca/content.php?catoid=34&navoid=10151#:~:text=program.-,engineering%20graduation%20average,-%E2%80%8BThe"
            className="text-sky-400 hover:text-sky-500"
          >
            the UofA Engineering Academic Regulations
          </Link>
          .
        </p>
        <p>
          For ALES, you can base your calculation on{" "}
          <Link
            href="https://calendar.ualberta.ca/content.php?catoid=34&navoid=10299#:~:text=graduation%20grade%20point%20average"
            className="text-sky-400 hover:text-sky-500"
          >
            the UofA ALES Academic Regulations
          </Link>
          .
        </p>
        <p>
          I do not guarantee the accuracy of the determined GPA, and take no
          responsibility for any use of the generated GPA anywhere or by anyone.
        </p>
        <p>
          This website does not collect any user data, and makes no network
          calls with respect to the data provided. If you want to double check
          for yourself, you can check the requisite code for this page here:{" "}
          <Link
            href="https://github.com/KonradStanski/KonradStaniszewski.github.io/tree/master/pages/projects/gpa-calculator.tsx"
            className="text-sky-400 hover:text-sky-500"
          >
            GitHub Repo
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default Disclaimer;
