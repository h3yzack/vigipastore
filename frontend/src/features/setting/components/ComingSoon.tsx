import { Result } from "antd";

export default function ComingSoon() {
    return (
        <>
        <Result
            status="404"
            title="Coming Soon!"
            subTitle="This feature is under development and will be available soon. Stay tuned!"
            extra={[]}
         />
        </>
    );
}