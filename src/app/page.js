"use client";
import React, { useState } from "react";
import {
  ChakraProvider,
  Box,
  Flex,
  Button,
  IconButton,
  Textarea,
  HStack,
  Heading,
  Select,
  Spacer,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon, CopyIcon, DeleteIcon } from "@chakra-ui/icons";
import dynamic from "next/dynamic";
import beautify from "js-beautify";
const ReactJson = dynamic(() => import("react-json-view"), { ssr: false });

// 动态加载 Monaco Editor，避免 SSR 问题
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  { ssr: false }
);

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [resultType, setResultType] = useState("beautify");
  const [viewMode, setViewMode] = useState("tree"); // "tree" or "text"
  const [treeCollapsed, setTreeCollapsed] = useState(false); // false: 全部展开, 1: 全部折叠到一级
  const [showLineNumbers, setShowLineNumbers] = useState(false); // 控制是否显示行号
  // 移除 showTree 相关内容

  // 格式化/美化
  const handleBeautify = () => {
    try {
      const obj = JSON.parse(input);
      const pretty = beautify(JSON.stringify(obj), { indent_size: 2 });
      setOutput(pretty);
      setResultType("beautify");
      setViewMode("tree");
      setTreeCollapsed(false); // 全部展开
    } catch (e) {
      alert("JSON 格式错误: " + e.message);
    }
  };

  // 压缩/最小化
  const handleMinify = () => {
    try {
      const obj = JSON.parse(input);
      const minified = JSON.stringify(obj);
      setOutput(minified);
      setResultType("minify");
      setViewMode("text");
    } catch (e) {
      alert("JSON 格式错误: " + e.message);
    }
  };

  // 校验
  const handleValidate = () => {
    try {
      JSON.parse(input);
      alert("JSON 校验通过");
    } catch (e) {
      alert("JSON 校验失败: " + e.message);
    }
  };

  // 复制结果
  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    // alert("已复制到剪贴板"); // 移除成功弹窗
  };

  // 清空
  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  // Monaco Editor 配置
  const editorOptions = {
    selectOnLineNumbers: true,
    minimap: { enabled: false },
    fontSize: 16,
    wordWrap: "on",
    scrollBeyondLastLine: false,
    automaticLayout: true,
  };

  return (
    <Box minH="100vh" bg="gray.50"> 
        {/* 顶部栏 */}
        <Flex as="header" align="center" px={6} py={4} boxShadow="md" bg="white"> 
          <Heading size="md" letterSpacing="wide">JSON 在线工具箱</Heading>
          <Spacer />
          <IconButton
            aria-label="切换深色模式"
            icon={<SunIcon />}
            variant="ghost"
            size="md"
            ml={2}
            isDisabled
          />
        </Flex>

        {/* 主体区域 */}
        <Flex direction={{ base: "column", md: "row" }} px={{ base: 2, md: 8 }} py={6} gap={6}>
          {/* 左侧编辑区 */}
          <Box flex={1} minW={{ base: "100%", md: "50%" }} display="flex" flexDirection="column">
            <Box mb={2} fontWeight="bold">JSON 输入区</Box>
            <Box flex={1} borderRadius="md" overflow="hidden" borderWidth={1} borderColor="gray.200" minH="400px"> 
              <MonacoEditor
                height="400px"
                language="json"
                value={input}
                options={editorOptions}
                onChange={(value) => setInput(value || "")}
                theme="vs-light"
              />
            </Box>
            <HStack mt={3} spacing={2}>
              <Button colorScheme="blue" onClick={handleBeautify}>格式化/美化</Button>
              <Button colorScheme="teal" onClick={handleMinify}>压缩/最小化</Button>
              <Button colorScheme="purple" onClick={handleValidate}>校验</Button>
              <Button leftIcon={<DeleteIcon />} onClick={handleClear} variant="outline">清空</Button>
            </HStack>
          </Box>

          {/* 右侧结果区 */}
          <Box flex={1} minW={{ base: "100%", md: "50%" }}>
            <Box mb={2} fontWeight="bold">结果区</Box>
            <Box borderRadius="md" overflow="hidden" borderWidth={1} borderColor="gray.200" minH="400px" bg="white" p={4} display="flex" flexDirection="column" gap={4}> 
              {/* 结果区内容根据 viewMode 切换 */}
              {viewMode === "tree" && (
                <Box height="360px" overflowY="auto" overflowX="auto" style={{ whiteSpace: "pre" }}>
                  {(() => {
                    try {
                      if (!output) return null;
                      const data = JSON.parse(output);
                      return (
                        <ReactJson
                          src={data}
                          name={null}
                          collapsed={treeCollapsed}
                          enableClipboard={false}
                          displayDataTypes={false}
                          displayObjectSize={false}
                          style={{ fontSize: 16 }}
                          theme="rjv-default"
                        />
                      );
                    } catch {
                      return null;
                    }
                  })()}
                </Box>
              )}
              {viewMode === "text" && (
                <MonacoEditor
                  height="360px"
                  language="json"
                  value={output}
                  options={{
                    readOnly: true,
                    lineNumbers: "on",
                    fontSize: 16,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    automaticLayout: true,
                  }}
                  theme="vs-light"
                />
              )}
            </Box>
            {/* 视图切换和折叠按钮 */}
            <Box mt={2} display="flex" gap={2}>
              <Button size="sm" colorScheme={viewMode === "tree" ? "blue" : "gray"} onClick={() => setViewMode("tree")}>树形视图</Button>
              <Button size="sm" colorScheme={viewMode === "text" ? "blue" : "gray"} onClick={() => setViewMode("text")}>代码视图</Button>
              {viewMode === "tree" && (
                <Button size="sm" onClick={() => setTreeCollapsed(treeCollapsed === false ? true : false)}>
                  {treeCollapsed === false ? "全部折叠" : "全部展开"}
                </Button>
              )}
            </Box>
            <HStack mt={3} spacing={2}>
              <Button leftIcon={<CopyIcon />} colorScheme="green" onClick={handleCopy} isDisabled={!output}>复制结果</Button>
              {/* 预留更多功能按钮 */}
              <Select width="180px" placeholder="更多功能 (开发中)" isDisabled>
                <option value="escape">JSON 转义</option>
                <option value="unescape">JSON 反转义</option>
                <option value="sort">JSON 排序</option>
                <option value="to-code">转多语言代码</option>
                <option value="to-csv">转 CSV/Excel</option>
                <option value="to-yaml">JSON &lt;-&gt; YAML</option>
                <option value="to-xml">JSON &lt;-&gt; XML</option>
              </Select>
            </HStack>
          </Box>
        </Flex>

        {/* 页脚 */}
        <Box as="footer" textAlign="center" py={4} color="gray.500" fontSize="sm">
          © {new Date().getFullYear()} JSON 工具箱 | Powered by Next.js & Chakra UI
        </Box>
      </Box>
  );
}
