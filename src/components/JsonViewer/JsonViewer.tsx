import ReactJson from "react-json-view";

interface Props {
  height?: string;
  src: string;
}

export default function JsonViewer(props: Props) {
  const { height, src } = props;
  return (
    <ReactJson
      src={JSON.parse(src)}
      name={false}
      theme="chalk"
      displayDataTypes={false}
      style={{
        overflow: "auto",
        height: height,
      }}
    />
  );
}
