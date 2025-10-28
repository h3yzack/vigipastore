import type { VaultData } from "@/common/types/vault";
import { Button, Card, Descriptions, message, Skeleton, Tag, type DescriptionsProps } from "antd";
import { AppstoreOutlined, CloseOutlined, CopyOutlined, EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { useVaultService } from "../hook/useVaultService";
import { tagColors } from "@/common/types/app";

const VaultDetails = forwardRef(({ recordId, onClose }: { recordId: string, onClose: () => void }, ref) => {

   const [selectedRecord, setSelectedRecord] =  useState<VaultData | null>(null);
   const [showPassword, setShowPassword] = useState(false);
   const [loading, setLoading] = useState(false);
   const vaultService = useVaultService();

   const handleClose = () => {
    onClose();
   }

   const fetchRecord = useCallback(async () => {
      try {
         setLoading(true);
         const toEditRecord = await vaultService.getVaultRecordById(recordId);
         setSelectedRecord(toEditRecord);
      } catch (error) {
         console.error("Error fetching record:", error);
      } finally {
         setLoading(false);
      }
   }, [recordId, vaultService]);

   useImperativeHandle(ref, () => ({
      triggerReload() {
         fetchRecord();
      },
   }));

   useEffect(() => {
      if (recordId ) {
         setShowPassword(false);
         fetchRecord();
      }
   }, [recordId, fetchRecord]);

   const items: DescriptionsProps['items'] = [];

   const handleViewPassword = () => {
      setShowPassword(!showPassword);
    };

    const copyToClipboard = async () => {
      try {
         await navigator.clipboard.writeText(selectedRecord!.password!);
         message.success('Password copied to clipboard');
      } catch {
         // Fallback for older browsers
         const textArea = document.createElement('textarea');
         textArea.value = selectedRecord!.password!;
         document.body.appendChild(textArea);
         textArea.select();
         document.execCommand('copy');
         document.body.removeChild(textArea);
         message.success('Password copied to clipboard');
      }
   };

   if (selectedRecord) {
       items.push(
           {
               key: '1',
               label: 'Title',
               children: selectedRecord.title.toUpperCase(),
               span: 'filled'
           },
           {
               key: '2',
               label: 'Login ID',
               children: selectedRecord.loginId,
               span: 'filled'
           },
           {
               key: '3',
               label: 'Password',
               children: (
                  <>
                     <span className="pr-3">{
                        showPassword ? selectedRecord.password : '•'.repeat(selectedRecord.password!.length)
                        }
                     </span>
                     {showPassword && <Button
                     type="text"
                     size="small"
                     icon={<CopyOutlined />}
                     onClick={copyToClipboard}
                     />}
                     <Button 
                        shape="circle" 
                        type="default"
                        size="small" 
                        icon={!showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />} 
                        onClick={handleViewPassword}
                    />
                  </>
               ),
               span: 'filled'
           },
           {
               key: '4',
               label: 'Category',
               children: (
                     <> 
                        {selectedRecord.tags && selectedRecord.tags.map((tag) => {
                              const index = tag.charCodeAt(0) % tagColors.length;
                              return (
                                    <Tag color={tagColors[index]} key={tag}>
                                       {tag.toUpperCase()}
                                    </Tag>
                              );
                        })}
                     </>
               ),
               span: 'filled'
           },
           {
               key: '5',
               label: 'Notes',
               children: (<pre className="whitespace-pre-wrap">{selectedRecord.notes || 'N/A'}</pre>),
               span: 'filled'
           },
       );
   }

    return (
        <>
            <Card
                className="p-5 h-full"
                title={
                  <>
                  <AppstoreOutlined style={{ fontSize: "1.2em" }}/>
                  <span className="pl-2">Record Details</span>
                  </>
                }
                extra={<Button size="large" type="text" shape="circle" icon={<CloseOutlined />} onClick={handleClose}></Button>}
            >   
            {loading && <Skeleton />}
                {!loading && selectedRecord && (
                    <div>
                        <Descriptions layout="vertical" items={items} />
                    </div>
                )}
            </Card>
        </>
    );
});

export default VaultDetails;