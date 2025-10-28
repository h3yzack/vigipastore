import { useAuth } from "@/common/hook/useAuth";
import { Button, Card, Form, Input } from "antd";
import { useSettingService } from "@/features/setting/hook/useSettingService";
import type { ProfileInfoRequest } from "@/common/types/userInfo";

export default function ProfileInfo() {
   const [accountForm] = Form.useForm();
   const {userInfo} = useAuth();
   const {saveProfileInfo} = useSettingService();

   const handleAccountSubmit = async ({ displayName }: { displayName: string }) => {
      const userData: ProfileInfoRequest = {
        id: userInfo!.id!,
        fullName: displayName,
        twoFaStatus: userInfo!.twoFaStatus || false,
      }
      
      await saveProfileInfo(userData);

   };

    return (
        <Card title="Profile Information" style={{ marginBottom: '16px' }}>
            <Form
              form={accountForm}
              layout="vertical"
              onFinish={handleAccountSubmit}
              initialValues={{
                email: userInfo?.email,
                displayName: userInfo?.fullName
              }}
            >
              <Form.Item
                label="Display Name"
                name="displayName"
                wrapperCol={{ span: 6 }}
                rules={[{ required: true, message: 'Please enter your display name' }]}
              >
                <Input placeholder="Your display name" />
              </Form.Item>
              
              <Form.Item
                label="Email Address"
                name="email"
                wrapperCol={{ span: 6 }}
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="your.email@example.com" disabled />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Update Profile
                </Button>
              </Form.Item>
            </Form>
        </Card>
    );
}