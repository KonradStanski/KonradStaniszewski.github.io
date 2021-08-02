import Link from "next/link";

const Disclaimer = (): JSX.Element => {
    return (
        <div className="pt-10">
            <h2>**Disclaimer**</h2>
            <p>
                This calculator is loosely based on this:{" "}
                <Link href="https://calendar.ualberta.ca/content.php?catoid=34&navoid=10107#additional-grades-and-remarks">
                    UofA Academic Regulations
                </Link>
                <br />
                It does not however calculate graduating GPA{"'"}s as the way those are calculated differs from faculty
                to faculty.
                <br />
                For engineers, you can base your calcuation on this:{" "}
                <Link href="https://calendar.ualberta.ca/content.php?catoid=34&navoid=10151#:~:text=program.-,engineering%20graduation%20average,-%E2%80%8BThe">
                    UofA Engineering Academic Regulations
                </Link>
                <br />
                For ales, you can base your calcuation on this:{" "}
                <Link href="https://calendar.ualberta.ca/content.php?catoid=34&navoid=10299#:~:text=graduation%20grade%20point%20average">
                    UofA ALES Academic Regulations
                </Link>
                <br />
                I do not guarantee the accuracy of the determined GPA, and take no responsibility for any use of the
                generated gpa anywhere and by anyone.
                <br />
                This website does not collect any user data, and makes no network calls with respect to the data
                provided. If you want to double check for yourself, you can check the requisite code for this page here:{" "}
                <Link href="https://github.com/KonradStanski/KonradStaniszewski.github.io/tree/master/src/pages/projects/gpacalculator">
                    Github Repo
                </Link>
                <br />
                If
            </p>
        </div>
    );
};

export default Disclaimer;
