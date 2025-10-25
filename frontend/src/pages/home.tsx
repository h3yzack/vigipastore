import { Button, Input, Select } from "antd";

import { PlusOutlined, SearchOutlined, UnorderedListOutlined } from "@ant-design/icons";
import SecretList from "../components/secret-list";
import AddSecret from "../components/secret-form";
import { useState } from "react";
import type { VaultRecord } from "@/common/types/secret";


export default function HomePage() {

  const onChange = (value: string) => {
    console.log(`selected ${value}`);
  };

  const onSearch = (value: string) => {
    console.log("search:", value);
  };

  // Centralized state management
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VaultRecord | null>(null);
  const [data, setData] = useState<VaultRecord[]>([
    {
      id: "1",
      key: "1",
      name: "Test website",
      loginId: "john.brown",
      password: "123456",
      description: "Test user account",
      tags: ["nice", "developer"],
    },
    {
      id: "2",
      key: "2",
      name: "Github account",
      loginId: "github.user",
      password: "123456",
      description: "Github user account",
      tags: ["development", "work"],
    },
    {
      id: "3",
      key: "3",
      name: "Gmail account",
      loginId: "gmail.user@gmail.com",
      password: "123456",
      description: "Personal email account",
      tags: ["email"],
    },
  ]);

  // Show add new modal
  const showAddModal = async () => {
    setEditingRecord(null);
    setIsModalVisible(true);
  };

  // Show edit modal
  const showEditModal = (record: VaultRecord) => {
    setEditingRecord(record);
    setIsModalVisible(true);
  };

  // Delete record
  const handleDelete = (record: VaultRecord) => {
    console.log("Deleting record:", record);
    setData(data.filter((item) => item.id !== record.id));
  };

  // Close modal
  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
  };

  // Unified form submission handler
  const handleFormSubmit = (values: any) => {
    if (editingRecord) {
      // Update existing record
      console.log("Updating record:", values);
      setData(
        data.map((item) =>
          item.id === editingRecord.id
            ? {
                ...item,
                name: values.name,
                loginId: values.loginId,
                password: values.password || "123455",
                description: values.description || "",
                tags: values.category || [],
              }
            : item
        )
      );
    } else {
      // Add new record
      console.log("Adding new record:", values);
      const newRecord: VaultRecord = {
        id: Date.now().toString(),
        key: Date.now().toString(),
        name: values.name,
        loginId: values.loginId,
        password: values.password,
        description: values.description || "",
        tags: values.category || [],
      };
      setData([...data, newRecord]);
    }
    handleModalClose();
  };

  return (
    <>
      <div style={{ margin: "0 auto" }} className="p-5 flex flex-col gap-5">
        

        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">
            <span className="flex items-center gap-2">
              <UnorderedListOutlined />
              All Secret Items
            </span>
          </h1>
          <div className="ml-4 flex items-center gap-2">
            <Select size="large"
              className="min-w-[180px]"
              showSearch
              placeholder="Filter by tag"
              optionFilterProp="label"
              onChange={onChange}
              onSearch={onSearch}
              allowClear
              options={[
                {
                  value: "personal",
                  label: "Personal",
                },
                {
                  value: "email",
                  label: "Email",
                },
                {
                  value: "banking",
                  label: "Banking",
                },
              ]}
            />
            <Input
              placeholder="Quick Search..."
              allowClear
              prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
              style={{
                maxWidth: 520,
                width: "100%",
                borderRadius: 9999,
              }}
              size="large"
            />
            <Button size="large"
              type="primary" shape="circle"
              icon={<PlusOutlined />}
              onClick={showAddModal}
            >
            </Button>
          </div>
        </div>
        <div className="">
          <SecretList
            data={data}
            onEdit={showEditModal}
            onDelete={handleDelete}
          />
        </div>

        {/* Shared AddSecret modal */}
        <AddSecret
          visible={isModalVisible}
          onCreate={handleFormSubmit}
          onCancel={handleModalClose}
          editRecord={editingRecord}
        />
      </div>
    </>
  );
}
