import { ReactElement, useContext } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import AppContext, {
  Status,
  IResults,
  Steps,
  DetailsType,
  IResultsDetails,
} from "../AppContext";
import JsonViewer from "../JsonViewer/JsonViewer";
import XMLViewer from "../XMLViewer/XMLViewer";
import ResultCount from "./ResultCount";

const iconWidth = 30;

interface Props {
  title: string;
  step: Steps;
  results: IResults;
  children?;
}

const statusIcons = new Map<Status, ReactElement>([
  [Status.Pending, <AccessTimeFilledIcon color="info" />],
  [Status.Pass, <CheckCircleIcon color="success" />],
  [Status.Fail, <CancelIcon color="error" />],
]);

const createDetails = (
  { detailsType, details }: IResultsDetails,
  index: number
) => {
  switch (detailsType) {
    case DetailsType.file:
      return (
        <div key={index}>
          <p>Filename: {details.name}</p>
          <p>Filetype: {details.type}</p>
          <p>Size in bytes: {details.size}</p>
          <p>
            Last modified date:{" "}
            {new Date(details.lastModified).toLocaleString("en-US")}
          </p>
        </div>
      );
    case DetailsType.json:
      return <JsonViewer key={index} src={details} height="50vh" />;
    case DetailsType.text:
      return <Typography key={index}>{details}</Typography>;
    case DetailsType.xml:
      return <XMLViewer key={index} value={details} height="50vh" />;
  }
};

export default function TestStep(props: Props) {
  const { title, step, results, children } = props;
  const { testStepExpanded, setTestStepExpanded } = useContext(AppContext);

  const handleAccordionChange = (panel: Steps) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setTestStepExpanded(isExpanded ? panel : false);
  };

  return (
    <Accordion
      expanded={testStepExpanded === step}
      onChange={handleAccordionChange(step)}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ width: `${iconWidth}px`, flexShrink: 0 }}>
          {statusIcons.get(results.status)}
        </Typography>
        <>
          &nbsp;&nbsp;&nbsp;
          {title}
          <ResultCount
            label="Errors"
            color="error"
            count={results.errorCount}
          />
          <ResultCount
            label="Positives"
            color="success"
            count={results.positiveCount}
          />
          <ResultCount
            label="Negatives"
            color="warning"
            count={results.negativeCount}
          />
          <ResultCount
            label="Scope Skips"
            color="info"
            count={results.scopeSkipCount}
          />
          <ResultCount
            label="Absent-Variable Skips"
            color="info"
            count={results.varSkipCount}
          />
        </>
      </AccordionSummary>
      <AccordionDetails>
        {children}
        {results.details.map(createDetails)}
      </AccordionDetails>
    </Accordion>
  );
}
